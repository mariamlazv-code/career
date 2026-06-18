import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not defined. Please add your Gemini API Key in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Analyze Syllabus and CV with Google Search Grounding to find real vacancies
app.post("/api/analyze-and-search", async (req: Request, res: Response): Promise<void> => {
  try {
    const { syllabusText, cvText, syllabusFile, cvFile, customPreferences } = req.body;

    if (!syllabusText && !cvText && !syllabusFile && !cvFile) {
      res.status(400).json({ error: "გთხოვთ ატვირთოთ ან ჩაწეროთ სილაბუსის ტექსტი ან CV ანალიზისთვის." });
      return;
    }

    const ai = getGeminiClient();

    const searchSystemInstruction = `შენ ხარ CareerNavigator AI - უნივერსიტეტის სტუდენტების პერსონალური კარიერული მენტორი და სტრატეგიული ასისტენტი.
შენი ამოცანაა, მომხმარებლის მიერ მოწოდებული აკადემიური სილაბუსებისა და CV-ს ანალიზის საფუძველზე, Google Search ინსტრუმენტის (Search Grounding) გამოყენებით მოიძიო, გააფილტრო და დააკავშირო რეალური საწყისი დონის (Entry-level, Junior) ვაკანსიები/სტაჟირებები თბილისსა და საქართველოში (მაგალითად, jobs.ge-ზე, hr.ge-ზე ან LinkedIn-ზე) სტუდენტის პროფილთან.

სერიოზულად მოეკიდე "Search Grounding" შესაძლებლობას. ჩამოაყალიბე მიზნობრივი საძიებო მოთხოვნები (Search Queries) სტუდენტის სივს/სილაბუსის შესაბამისად, რათა იპოვო რეალური აქტიური ვაკანსიები (მაგ. "react junior developer Tbilisi site:jobs.ge", "python internship თბილისი site:hr.ge", "QA junior jobs.ge").`;

    let searchPrompt = `შეასრულე შემდეგი სტუდენტის პროფილის ანალიზი და მოიძიო რეალური ვაკანსიები/სტაჟირებები:

სტუდენტის CV/გამოცდილება:
`;
    if (cvText) {
      searchPrompt += `${cvText}\n`;
    } else if (cvFile && cvFile.name) {
      searchPrompt += `[ატვირთულია ფაილი: ${cvFile.name}. გთხოვთ, წაიკითხო და გააანალიზო ეს თანდართული ფაილი.]\n`;
    } else {
      searchPrompt += `არ არის მოწოდებული\n`;
    }

    searchPrompt += `\nაკადემიური სილაბუსი/კურსები:\n`;
    if (syllabusText) {
      searchPrompt += `${syllabusText}\n`;
    } else if (syllabusFile && syllabusFile.name) {
      searchPrompt += `[ატვირთულია ფაილი: ${syllabusFile.name}. გთხოვთ, წაიკითხო და გააანალიზო ეს თანდართული ფაილი და მისი თემები.]\n`;
    } else {
      searchPrompt += `არ არის მოწოდებული\n`;
    }

    searchPrompt += `\nმომხმარებლის დამატებითი სურვილები:
${customPreferences || "არ არის მოწოდებული"}

გთხოვთ, შეასრულე შემდეგი ნაბიჯები და იპოვე რეალური ვაკანსიები:
1. სემანტიკური ანალიზი: ამოიღე მთავარი ტერმინები, ნასწავლი თეორიები, მეთოდოლოგიები და პრაქტიკული უნარები.
2. მიზნობრივი ძიება (Google Search Grounding): მოიძიე უახლესი აქტუალური ვაკანსიები/სტაჟირებები თბილისში, რომლებიც ყველაზე კარგად მიესადაგება ამ უნარებს.
3. კვალიფიკაციის თავსებადობის მატრიცა: თითოეული ნაპოვნი ვაკანსიისთვის განსაზღვრე პროცენტული შესაბამისობა და დაასაბუთე.
4. სტრატეგიული დეკომპოზიცია: შეადგინე კარიერული გზა, მიუთითე კომპეტენციური ნაპრალების (Gaps) შესახებ და ურჩიე კონკრეტული ნაბიჯები მათ შესავსებად.

მნიშვნელოვანია: ვაკანსიების სექციაში, იპოვე და მიუთითე რეალური 'url' წყაროები, რომლებიც Google Search ინსტრუმენტის მიერ იქნება ნაპოვნი (მაგ. jobs.ge-დან, hr.ge-დან, ან ლინკედინიდან).`;

    const parts: any[] = [{ text: searchPrompt }];

    if (cvFile && cvFile.data && cvFile.mimeType) {
      parts.push({
        inlineData: {
          data: cvFile.data,
          mimeType: cvFile.mimeType
        }
      });
    }

    if (syllabusFile && syllabusFile.data && syllabusFile.mimeType) {
      parts.push({
        inlineData: {
          data: syllabusFile.data,
          mimeType: syllabusFile.mimeType
        }
      });
    }

    // Step 1: Perform Grounded Google Search to find vacancies
    const searchResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: parts },
      config: {
        systemInstruction: searchSystemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const rawGroundedReport = searchResponse.text || "";

    // Extract real-time search grounding sources
    const groundingChunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const searchSources = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || "დასაქმების წყარო",
      uri: chunk.web?.uri || ""
    })).filter((src: any) => src.uri);

    // Schema for JSON output returning (for React App frontend parsing)
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        profileSummary: {
          type: Type.STRING,
          description: "მოკლე შეჯამება სტუდენტის აკადემიური უპირატესობებისა და CV-ის შესაძლებლობების შესახებ (ქართულად)."
        },
        keyStrengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "მთავარი უნარებისა და ტექნოლოგიების სია (მაქსიმუმ 5)."
        },
        vacancies: {
          type: Type.ARRAY,
          description: "შესაბამისი რეალური ვაკანსიები/სტაჟირებები (მაქსიმუმ 3).",
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "პოზიციის დასახელება" },
              company: { type: Type.STRING, description: "დამსაქმებელი კომპანია" },
              compatPercent: { type: Type.INTEGER, description: "თავსებადობის პროცენტი (1-100)" },
              rationale: { type: Type.STRING, description: "დეტალური დასაბუთება (რატომ შეესაბამება მის სილაბუსს/CV-ს, ქართულად)" },
              additionalSkillsRequired: { type: Type.ARRAY, items: { type: Type.STRING }, description: "აუცილებელი კომპეტენციები, რომლებიც დამატებით უნდა განავითაროს" },
              url: { type: Type.STRING, description: "დასაქმების საიტის ან კომპანიის საიტის რეალური ლინკი სადაც შეგიძლიათ იხილოთ ვაკანსია (გამოიყენე მიღებული რეალური ლინკი)" }
            },
            required: ["title", "company", "compatPercent", "rationale", "additionalSkillsRequired", "url"]
          }
        },
        strategicDecomposition: {
          type: Type.ARRAY,
          description: "სტრატეგიული ნაბიჯები კომპეტენციული ნაპრალების შესავსებად და დასასაქმებლად.",
          items: {
            type: Type.OBJECT,
            properties: {
              stage: { type: Type.STRING, description: "ეტაპი/დრო (მაგ. 'ეტაპი 1: სწავლის გაძლიერება')" },
              focus: { type: Type.STRING, description: "ფოკუსი (რა არის მთავარი მიზანი)" },
              actionPlan: { type: Type.STRING, description: "კონკრეტული სამოქმედო გეგმა და რეკომენდებული რესურსები" }
            },
            required: ["stage", "focus", "actionPlan"]
          }
        },
        fullReportMarkdown: {
          type: Type.STRING,
          description: "სრული, სტრუქტურირებული, მამოტივირებელი და ოფიციალური რეპორტი ქართულ ენაზე Markdown ფორმატში, სადაც დეტალურად იქნება გაწერილი სტუდენტის პროფილი, ნასწავლი სილაბუსის უნარები, აღმოჩენილი ვაკანსიები წყაროებითა და დეტალური სამოქმედო გეგმით."
        }
      },
      required: ["profileSummary", "keyStrengths", "vacancies", "strategicDecomposition", "fullReportMarkdown"]
    };

    const parserSystemInstruction = `შენ ხარ CareerNavigator AI სტრუქტურიზატორი ასისტენტი.
შენი ერთადერთი მიზანია მოწოდებული რეალური ვაკანსიების რეპორტის, CV-ის და სილაბუსის მონაცემების საფუძველზე შეადგინო მითითებულ სქემასთან (Response Schema) სრულად თავსებადი JSON.
პასუხის ყველა ველი (profileSummary, rationale, fullReportMarkdown და ა.შ.) შეავსე გამართულ ქართულ ენაზე, იყოს საოცრად კვალიფიციურად და მამოტივირებლად ჩამოყალიბებული, და რეალური მოძიებული ვაკანსიების ლინკები (url) ზუსტად გადაიტანე შესაბამის ველებში.`;

    const parserPrompt = `მოახდინე ქვემოთ მოცემული რეპორტისა და სტუდენტის მონაცემების სტრუქტურირება JSON ფორმატში, რომელიც მიჰყვება Response Schema-ს.

მოძიებული რეალური ვაკანსიების რეპორტი (Google Search-ით ნაპოვნი):
${rawGroundedReport}

გამოვლენილი რეალური ლინკების სია:
${JSON.stringify(searchSources)}

სტუდენტის CV:
${cvText || (cvFile ? `თანდართული CV ფაილიდან: ${cvFile.name}` : "არ არის მოწოდებული")}

სტუდენტის სილაბუსი/კურსი:
${syllabusText || (syllabusFile ? `თანდართული სილაბუსიდან: ${syllabusFile.name}` : "არ არის მოწოდებული")}

სტუდენტის დამატებითი სურვილები:
${customPreferences || "არ არის მოწოდებული"}`;

    // Step 2: Structure the grounded report content to JSON schema using generateContent
    const structuredResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: parserPrompt,
      config: {
        systemInstruction: parserSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3,
      },
    });

    const responseText = structuredResponse.text || "{}";
    let parsedResult = {};
    try {
      parsedResult = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", responseText);
      // Fallback response inside JSON
      parsedResult = {
        profileSummary: "სემანტიკური ანალიზის შედეგად გამოვლინდა სტუდენტის მაღალი აკადემიური პოტენციალი.",
        keyStrengths: ["ანალიტიკური აზროვნება", "აკადემიური ბაზისი"],
        vacancies: [],
        strategicDecomposition: [
          {
            stage: "ნაბიჯი 1",
            focus: "პროფესიული უნარების ჩამოყალიბება",
            actionPlan: "გაიარე პრაქტიკული კურსები და გაეცანი რეალურ გამოცემებს."
          }
        ],
        fullReportMarkdown: responseText || rawGroundedReport
      };
    }

    res.json({
      success: true,
      data: parsedResult,
      sources: searchSources
    });

  } catch (error: any) {
    console.error("Error in /api/analyze-and-search:", error);
    res.status(500).json({
      error: error.message || "სერვერზე მოხდა შეცდომა მონაცემების დამუშავებისას."
    });
  }
});

// 2. Chatbot endpoint for Career Guidance and CV feedback
app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages, studentProfile } = req.body;

    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "მესიჯების ისტორია არასწორი ფორმატისაა." });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `შენ ხარ CareerNavigator AI - უნივერსიტეტის სტუდენტების პერსონალური კარიერული მენტორი და სტრატეგიული ასისტენტი.
შენი დანიშნულებაა გასცე პროფესიონალური კარიერული რჩევები, გააანალიზო სტუდენტის CV, მისცე რჩევები გასაუბრებისთვის, CV-ის ოპტიმიზაციისთვის და დაეხმარო კარიერული ნაბიჯების დაგეგმვაში.

სტუდენტის მიმდინარე კონტექსტი:
CV: ${studentProfile?.cvText || "არ არის მოწოდებული"}
სილაბუსები / კურსები: ${studentProfile?.syllabusText || "არ არის მოწოდებული"}
მიმდინარე ძიების შედეგები: ${studentProfile?.analysisDone ? "ანალიზი წარმატებით დასრულდა" : "ჯერ არ დაწყებულა"}

კომუნიკაციის წესები:
1. ისაუბრე აკადემიურად გამართული, მეგობრული, უაღრესად მამოტივირებელი და პროფესიული ქართული ენით.
2. იყავი მაქსიმალურად კონსტრუქციული და პრაქტიკული, მიეცი კონკრეტული მაგალითები.
3. თუ კითხულობენ ვაკანსიებს, გაახსენე რომ მათ შეუძლიათ გამოიყენონ "ვაკანსიების ძიების" ფუნქცია მთავარ პანელზე, ან მოუძებნე Google Search-ით (უნდა ჩართო tools: [{ googleSearch: {} }]).`;

    // Map historical messages to Gemini format
    const chatContents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }], // Enable search also within chat for instant queries
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      reply: response.text || "ბოდიში, პასუხის გენერირება ვერ მოხერხდა."
    });

  } catch (error: any) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      error: error.message || "ჩატის დამუშავებისას მოხდა შეცდომა."
    });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerNavigator AI server started on port ${PORT}`);
  });
}

startServer();
