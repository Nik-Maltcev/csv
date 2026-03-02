export interface ShaftArticle {
  id: string
  manufacturer: string
  article: string
  wpgCode: string
}

let nextId = 1
export function generateId(): string {
  return `art-${nextId++}-${Date.now()}`
}

export const defaultArticles: ShaftArticle[] = [
  { manufacturer: "CLAAS", article: "Вал карданный (замена 0001242991) 0001242992", wpgCode: "1149311" },
  { manufacturer: "CLAAS", article: "Вал карданный (замена 0004980121) 0004978410", wpgCode: "1149736" },
  { manufacturer: "CLAAS", article: "Вал карданный (замена 0009873913) 0004978410", wpgCode: "1149961" },
  { manufacturer: "CLAAS", article: "Вал карданный (замена 0015994030) 0015994031", wpgCode: "1159484" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004802310", wpgCode: "1136828" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004812070", wpgCode: "1149252" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004812972", wpgCode: "1139531" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004819791", wpgCode: "1149643" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004819801", wpgCode: "1149644" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004839480", wpgCode: "1147350" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004948370", wpgCode: "1139416" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004960790", wpgCode: "1136930" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004966670", wpgCode: "1149422" },
  { manufacturer: "CLAAS", article: "Вал карданный 0004993171", wpgCode: "1136873" },
  { manufacturer: "CLAAS", article: "Вал карданный 0009066500", wpgCode: "1114956" },
  { manufacturer: "CLAAS", article: "Вал карданный 0009370422", wpgCode: "1194911" },
  { manufacturer: "CLAAS", article: "Вал карданный 0009576021", wpgCode: "1694298" },
  { manufacturer: "CLAAS", article: "Вал карданный 0009576693", wpgCode: "1118870" },
  { manufacturer: "CLAAS", article: "Вал карданный 0009576863", wpgCode: "1114137" },
  { manufacturer: "CLAAS", article: "Вал карданный 0013182981", wpgCode: "1147596" },
  { manufacturer: "CLAAS", article: "Вал карданный 0013218990", wpgCode: "1156754" },
  { manufacturer: "CLAAS", article: "Вал карданный 0013292731", wpgCode: "1690886" },
  { manufacturer: "CLAAS", article: "Вал карданный 0013320300", wpgCode: "1157812" },
  { manufacturer: "CLAAS", article: "Вал карданный 0014062711", wpgCode: "1601610" },
  { manufacturer: "CLAAS", article: "Вал карданный 0014062790", wpgCode: "1158646" },
  { manufacturer: "CLAAS", article: "Вал карданный 0014062800", wpgCode: "1158647" },
  { manufacturer: "CLAAS", article: "Вал карданный 0014064520", wpgCode: "1158734" },
  { manufacturer: "CLAAS", article: "Вал карданный 0014064530", wpgCode: "1158735" },
  { manufacturer: "CLAAS", article: "Вал карданный 0015994011", wpgCode: "1159466" },
  { manufacturer: "CLAAS", article: "Вал карданный 0015994032", wpgCode: "1159484" },
  { manufacturer: "CLAAS", article: "Вал карданный 0015994041", wpgCode: "1600365" },
  { manufacturer: "CLAAS", article: "Вал карданный 0015994390", wpgCode: "1159485" },
  { manufacturer: "CLAAS", article: "Вал карданный 0015994391", wpgCode: "1159485" },
  { manufacturer: "CLAAS", article: "Вал карданный 0015996020", wpgCode: "1600296" },
  { manufacturer: "CLAAS", article: "Вал карданный 0015996021", wpgCode: "1600296" },
  { manufacturer: "CLAAS", article: "Вал карданный 0023000710", wpgCode: "1157269" },
  { manufacturer: "CLAAS", article: "Вал карданный 004993890", wpgCode: "1153171" },
  { manufacturer: "CLAAS", article: "Вал карданный 13192391", wpgCode: "1149818" },
  { manufacturer: "CLAAS", article: "Вал карданный 4948350", wpgCode: "1139417" },
  { manufacturer: "CLAAS", article: "Вал карданный 4991801", wpgCode: "1139589" },
  { manufacturer: "CLAAS", article: "Вал карданный 6666401", wpgCode: "1115102" },
  { manufacturer: "CLAAS", article: "Вал карданный 8558661", wpgCode: "1694584" },
  { manufacturer: "CLAAS", article: "Вал карданный 9574791", wpgCode: "1692113" },
  { manufacturer: "CLAAS", article: "Вал карданный 9576864", wpgCode: "1114137" },
  { manufacturer: "CLAAS", article: "Вал карданный усиленный (замена 0015994031-У) 0015994032-У", wpgCode: "1159484" },
  { manufacturer: "CLAAS", article: "Вал карданный усиленный 00009576693-У", wpgCode: "1118870" },
  { manufacturer: "CLAAS", article: "Вал карданный усиленный 00015994011-У", wpgCode: "1159466" },
  { manufacturer: "CLAAS", article: "Вал карданный усиленный 00015994041-У", wpgCode: "1600365" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ101", wpgCode: "1189455" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ141", wpgCode: "1115271" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ362", wpgCode: "1693311" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ364", wpgCode: "1125631" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ442", wpgCode: "1694282" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ447", wpgCode: "1692719" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ448", wpgCode: "1692705" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ556", wpgCode: "1690317" },
  { manufacturer: "AMAZONE", article: "Вал карданный W100E-SD05. 810 mm русская вилка EJ471", wpgCode: "1694178" },
  { manufacturer: "AMAZONE", article: "Крестовина карданного вала Y116555", wpgCode: "1116555" },
  { manufacturer: "AMAZONE", article: "Вал карданный EJ443", wpgCode: "1694858" },
].map((a) => ({ ...a, id: generateId() }))

export function getPdfUrl(wpgCode: string): string {
  return `https://www.walterscheid.com/out/pictures/media/ersatzteillisten/${wpgCode}.pdf`
}

export function getUniqueWpgCodes(data: ShaftArticle[]): string[] {
  return [...new Set(data.map((a) => a.wpgCode))]
}

/** Generate all 10 variations of a WPG code (last digit 0-9) */
export function getBruteForceVariations(wpgCode: string): string[] {
  const base = wpgCode.slice(0, -1)
  return Array.from({ length: 10 }, (_, i) => `${base}${i}`)
}

/** Get all articles that map to a given WPG code */
export function getArticlesForCode(data: ShaftArticle[], wpgCode: string): ShaftArticle[] {
  return data.filter((a) => a.wpgCode === wpgCode)
}
/** Parse CSV text into ShaftArticle[]. Expects columns: manufacturer, article, wpgCode (with or without header row) */
export function parseCsvToArticles(csvText: string): ShaftArticle[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length === 0) return []

  // Detect if first row is a header
  const firstLine = lines[0].toLowerCase()
  const startsWithHeader =
    firstLine.includes("manufacturer") ||
    firstLine.includes("производитель") ||
    firstLine.includes("article") ||
    firstLine.includes("артикул") ||
    firstLine.includes("wpg")
  const dataLines = startsWithHeader ? lines.slice(1) : lines

  // Detect delimiter: semicolon or comma
  const delimiter = dataLines[0]?.includes(";") ? ";" : ","

  return dataLines
    .map((line) => {
      const parts = line.split(delimiter).map((p) => p.trim().replace(/^["']|["']$/g, ""))
      if (parts.length < 3) return null
      const [manufacturer, article, wpgCode] = parts
      if (!wpgCode) return null
      return { id: generateId(), manufacturer: manufacturer || "N/A", article: article || "N/A", wpgCode }
    })
    .filter((a): a is ShaftArticle => a !== null)
}
