import type { NextApiRequest, NextApiResponse } from "next";

const RAW = "https://raw.githubusercontent.com/davisvelardecamaqui/CallForScience/main/CallForScienceAPP.csv";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const r = await fetch(RAW, { cache: "no-store" });
    if (!r.ok) throw new Error("CSV fetch failed");
    const text = await r.text();
    res.setHeader("Cache-Control", "s-maxage=600, stale-while-revalidate");
    res.status(200).send(text);
  } catch {
    res.status(500).json({ error: "CSV unavailable" });
  }
}
