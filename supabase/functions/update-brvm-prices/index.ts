import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlApiKey) {
      throw new Error("FIRECRAWL_API_KEY is not configured");
    }

    // Use Firecrawl to scrape BRVM (bypasses TLS issues)
    const scrapeResponse = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: "https://www.brvm.org/fr/cours-actions/0",
        formats: ["html"],
        waitFor: 3000,
      }),
    });

    const scrapeData = await scrapeResponse.json();
    if (!scrapeResponse.ok || !scrapeData.success) {
      throw new Error(`Firecrawl error: ${scrapeData.error || scrapeResponse.statusText}`);
    }

    const html = scrapeData.data?.html || "";

    // Parse the HTML table
    const assets: Array<{
      ticker: string;
      name: string;
      current_price: number | null;
      previous_close: number | null;
      variation: number | null;
      volume: number | null;
    }> = [];

    // Find all tables and pick the largest one with ticker content
    const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
    const tables = [...html.matchAll(tableRegex)];

    let mainTable = "";
    for (const match of tables) {
      if (match[1].length > mainTable.length) {
        mainTable = match[1];
      }
    }

    if (!mainTable) {
      const fallbackRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
      const allTables = [...html.matchAll(fallbackRegex)];
      for (const match of allTables) {
        if (match[1].includes("SNTS") || match[1].includes("SGBC") || match[1].includes("ORAC")) {
          if (match[1].length > mainTable.length) {
            mainTable = match[1];
          }
        }
      }
    }

    if (!mainTable) {
      return new Response(JSON.stringify({ error: "Tableau des cours introuvable", updated: 0, created: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [...mainTable.matchAll(rowRegex)];

    for (const row of rows) {
      const cellRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cells = [...row[1].matchAll(cellRegex)].map(c =>
        c[1].replace(/<[^>]+>/g, "").trim()
      );

      // Column order: Symbole, Nom, Volume, Cours veille, Cours Ouverture, Cours Clôture, Variation(%)
      if (cells.length < 7) continue;

      const ticker = cells[0]?.trim();
      const name = cells[1]?.trim();

      if (!ticker || !name || ticker === "Symbole" || ticker.length > 10) continue;

      const parsePrice = (val: string): number | null => {
        if (!val || val === "-" || val === "N/A") return null;
        const cleaned = val.replace(/\s/g, "").replace(",", ".");
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
      };

      const volume = cells[2] ? parseInt(cells[2].replace(/\s/g, ""), 10) || null : null;
      const previousClose = parsePrice(cells[3]);
      // cells[4] = Cours Ouverture (skip)
      const currentPrice = parsePrice(cells[5]); // Cours Clôture
      const variation = parsePrice(cells[6]);

      if (ticker && name) {
        assets.push({ ticker, name, current_price: currentPrice, previous_close: previousClose, variation, volume });
      }
    }

    let updated = 0;
    let created = 0;
    const errors: string[] = [];

    for (const asset of assets) {
      try {
        const { data: existing } = await supabase
          .from("assets")
          .select("id")
          .eq("ticker", asset.ticker)
          .maybeSingle();

        if (existing) {
          const { error } = await supabase
            .from("assets")
            .update({
              name: asset.name,
              current_price: asset.current_price,
              previous_close: asset.previous_close,
              variation: asset.variation,
              volume: asset.volume,
              price_updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
          if (error) throw error;
          updated++;
        } else {
          const { error } = await supabase
            .from("assets")
            .insert({
              ticker: asset.ticker,
              name: asset.name,
              current_price: asset.current_price,
              previous_close: asset.previous_close,
              variation: asset.variation,
              volume: asset.volume,
              asset_type: "action",
              exchange: "BRVM",
              sector: null,
              price_updated_at: new Date().toISOString(),
            });
          if (error) throw error;
          created++;
        }
      } catch (e) {
        errors.push(`${asset.ticker}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({ updated, created, total: assets.length, errors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
