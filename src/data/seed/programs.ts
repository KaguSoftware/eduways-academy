import type { Program, ProgramLevel } from "@/lib/types";

/** Catalogue of program names shared across universities: slug → {fa,en,category,faculty,duration} */
const CAT: Record<string, { fa: string; en: string; cat: string; fac: { fa: string; en: string }; years: number }> = {
  "computer-engineering": { fa: "مهندسی کامپیوتر", en: "Computer Engineering", cat: "cat-cs", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "software-engineering": { fa: "مهندسی نرم‌افزار", en: "Software Engineering", cat: "cat-cs", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "artificial-intelligence": { fa: "مهندسی هوش مصنوعی و داده", en: "Artificial Intelligence & Data Engineering", cat: "cat-cs", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "electrical-electronics-engineering": { fa: "مهندسی برق و الکترونیک", en: "Electrical & Electronics Engineering", cat: "cat-engineering", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "mechanical-engineering": { fa: "مهندسی مکانیک", en: "Mechanical Engineering", cat: "cat-engineering", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "civil-engineering": { fa: "مهندسی عمران", en: "Civil Engineering", cat: "cat-engineering", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "industrial-engineering": { fa: "مهندسی صنایع", en: "Industrial Engineering", cat: "cat-engineering", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "aerospace-engineering": { fa: "مهندسی هوافضا", en: "Aerospace Engineering", cat: "cat-aviation", fac: { fa: "دانشکده هوانوردی و فضانوردی", en: "Faculty of Aeronautics & Astronautics" }, years: 4 },
  "chemical-engineering": { fa: "مهندسی شیمی", en: "Chemical Engineering", cat: "cat-engineering", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "biomedical-engineering": { fa: "مهندسی پزشکی", en: "Biomedical Engineering", cat: "cat-engineering", fac: { fa: "دانشکده مهندسی", en: "Faculty of Engineering" }, years: 4 },
  "medicine": { fa: "پزشکی", en: "Medicine", cat: "cat-medicine", fac: { fa: "دانشکده پزشکی", en: "Faculty of Medicine" }, years: 6 },
  "dentistry": { fa: "دندانپزشکی", en: "Dentistry", cat: "cat-dentistry", fac: { fa: "دانشکده دندانپزشکی", en: "Faculty of Dentistry" }, years: 5 },
  "pharmacy": { fa: "داروسازی", en: "Pharmacy", cat: "cat-pharmacy", fac: { fa: "دانشکده داروسازی", en: "Faculty of Pharmacy" }, years: 5 },
  "nursing": { fa: "پرستاری", en: "Nursing", cat: "cat-health", fac: { fa: "دانشکده علوم سلامت", en: "Faculty of Health Sciences" }, years: 4 },
  "physiotherapy": { fa: "فیزیوتراپی و توانبخشی", en: "Physiotherapy & Rehabilitation", cat: "cat-health", fac: { fa: "دانشکده علوم سلامت", en: "Faculty of Health Sciences" }, years: 4 },
  "nutrition-dietetics": { fa: "تغذیه و رژیم‌درمانی", en: "Nutrition & Dietetics", cat: "cat-health", fac: { fa: "دانشکده علوم سلامت", en: "Faculty of Health Sciences" }, years: 4 },
  "business-administration": { fa: "مدیریت بازرگانی", en: "Business Administration", cat: "cat-business", fac: { fa: "دانشکده مدیریت", en: "Faculty of Business" }, years: 4 },
  "economics": { fa: "اقتصاد", en: "Economics", cat: "cat-business", fac: { fa: "دانشکده اقتصاد و علوم اداری", en: "Faculty of Economics & Administrative Sciences" }, years: 4 },
  "international-trade": { fa: "تجارت بین‌الملل و لجستیک", en: "International Trade & Logistics", cat: "cat-business", fac: { fa: "دانشکده مدیریت", en: "Faculty of Business" }, years: 4 },
  "mba": { fa: "MBA (کارشناسی ارشد مدیریت)", en: "MBA", cat: "cat-business", fac: { fa: "دانشکده تحصیلات تکمیلی", en: "Graduate School of Business" }, years: 1.5 },
  "international-relations": { fa: "روابط بین‌الملل", en: "International Relations", cat: "cat-social", fac: { fa: "دانشکده علوم اجتماعی", en: "Faculty of Social Sciences" }, years: 4 },
  "psychology": { fa: "روانشناسی", en: "Psychology", cat: "cat-social", fac: { fa: "دانشکده علوم اجتماعی", en: "Faculty of Social Sciences" }, years: 4 },
  "law": { fa: "حقوق", en: "Law", cat: "cat-law", fac: { fa: "دانشکده حقوق", en: "Faculty of Law" }, years: 4 },
  "architecture": { fa: "معماری", en: "Architecture", cat: "cat-architecture", fac: { fa: "دانشکده معماری", en: "Faculty of Architecture" }, years: 4 },
  "interior-architecture": { fa: "معماری داخلی", en: "Interior Architecture", cat: "cat-architecture", fac: { fa: "دانشکده معماری و طراحی", en: "Faculty of Architecture & Design" }, years: 4 },
  "industrial-design": { fa: "طراحی صنعتی", en: "Industrial Design", cat: "cat-architecture", fac: { fa: "دانشکده معماری و طراحی", en: "Faculty of Architecture & Design" }, years: 4 },
  "graphic-design": { fa: "طراحی گرافیک و ارتباط تصویری", en: "Graphic Design", cat: "cat-arts", fac: { fa: "دانشکده هنر و طراحی", en: "Faculty of Art & Design" }, years: 4 },
  "film-television": { fa: "سینما و تلویزیون", en: "Film & Television", cat: "cat-arts", fac: { fa: "دانشکده ارتباطات", en: "Faculty of Communication" }, years: 4 },
  "new-media": { fa: "رسانه‌های نوین و ارتباطات", en: "New Media & Communication", cat: "cat-arts", fac: { fa: "دانشکده ارتباطات", en: "Faculty of Communication" }, years: 4 },
  "english-language-teaching": { fa: "آموزش زبان انگلیسی", en: "English Language Teaching", cat: "cat-education", fac: { fa: "دانشکده علوم تربیتی", en: "Faculty of Education" }, years: 4 },
  "tourism-management": { fa: "مدیریت گردشگری و هتلداری", en: "Tourism & Hotel Management", cat: "cat-tourism", fac: { fa: "دانشکده علوم کاربردی", en: "School of Applied Sciences" }, years: 4 },
  "gastronomy": { fa: "گاسترونومی و هنر آشپزی", en: "Gastronomy & Culinary Arts", cat: "cat-tourism", fac: { fa: "دانشکده علوم کاربردی", en: "School of Applied Sciences" }, years: 4 },
  "pilot-training": { fa: "خلبانی", en: "Pilot Training", cat: "cat-aviation", fac: { fa: "دانشکده هوانوردی", en: "School of Aviation" }, years: 4 },
  "maritime-transportation": { fa: "مدیریت حمل‌ونقل دریایی", en: "Maritime Transportation Management Engineering", cat: "cat-aviation", fac: { fa: "دانشکده دریانوردی", en: "Maritime Faculty" }, years: 4 },
  "molecular-biology": { fa: "زیست‌شناسی مولکولی و ژنتیک", en: "Molecular Biology & Genetics", cat: "cat-engineering", fac: { fa: "دانشکده علوم", en: "Faculty of Science" }, years: 4 },
  "data-science-msc": { fa: "علم داده (ارشد)", en: "Data Science (MSc)", cat: "cat-cs", fac: { fa: "دانشکده تحصیلات تکمیلی", en: "Graduate School" }, years: 2 },
  "computer-engineering-msc": { fa: "مهندسی کامپیوتر (ارشد)", en: "Computer Engineering (MSc)", cat: "cat-cs", fac: { fa: "دانشکده تحصیلات تکمیلی", en: "Graduate School" }, years: 2 },
  "architecture-march": { fa: "معماری (ارشد)", en: "Architecture (MArch)", cat: "cat-architecture", fac: { fa: "دانشکده تحصیلات تکمیلی", en: "Graduate School" }, years: 2 },
  "clinical-psychology-ma": { fa: "روانشناسی بالینی (ارشد)", en: "Clinical Psychology (MA)", cat: "cat-social", fac: { fa: "دانشکده تحصیلات تکمیلی", en: "Graduate School" }, years: 2 },
  "computer-engineering-phd": { fa: "مهندسی کامپیوتر (دکتری)", en: "Computer Engineering (PhD)", cat: "cat-cs", fac: { fa: "دانشکده تحصیلات تکمیلی", en: "Graduate School" }, years: 4 },
  "business-phd": { fa: "مدیریت (دکتری)", en: "Business Administration (PhD)", cat: "cat-business", fac: { fa: "دانشکده تحصیلات تکمیلی", en: "Graduate School" }, years: 4 },
};

type Lang = Program["language"];
/** [programSlug, level, language, tuitionUSD] */
type Row = [string, ProgramLevel, Lang, number];

const BY_UNI: Record<string, Row[]> = {
  "istanbul-technical-university": [
    ["computer-engineering", "bachelor", "en", 4500], ["electrical-electronics-engineering", "bachelor", "tr-en", 3500], ["mechanical-engineering", "bachelor", "tr-en", 3500],
    ["civil-engineering", "bachelor", "tr-en", 3200], ["industrial-engineering", "bachelor", "en", 4000], ["aerospace-engineering", "bachelor", "en", 4500], ["chemical-engineering", "bachelor", "tr-en", 3200],
    ["architecture", "bachelor", "tr-en", 3500], ["industrial-design", "bachelor", "tr-en", 3000], ["business-administration", "bachelor", "en", 3000], ["economics", "bachelor", "en", 2800],
    ["computer-engineering-msc", "master", "en", 2500], ["data-science-msc", "master", "en", 2500], ["architecture-march", "master", "en", 2200], ["computer-engineering-phd", "phd", "en", 1500],
  ],
  "bogazici-university": [
    ["computer-engineering", "bachelor", "en", 5000], ["electrical-electronics-engineering", "bachelor", "en", 5000], ["mechanical-engineering", "bachelor", "en", 4500], ["civil-engineering", "bachelor", "en", 4500],
    ["industrial-engineering", "bachelor", "en", 4500], ["chemical-engineering", "bachelor", "en", 4500], ["business-administration", "bachelor", "en", 4000], ["economics", "bachelor", "en", 4000],
    ["psychology", "bachelor", "en", 3800], ["international-relations", "bachelor", "en", 3800], ["molecular-biology", "bachelor", "en", 4000], ["english-language-teaching", "bachelor", "en", 3000],
    ["computer-engineering-msc", "master", "en", 2500], ["mba", "master", "en", 9000], ["computer-engineering-phd", "phd", "en", 1800],
  ],
  "istanbul-university": [
    ["medicine", "bachelor", "tr", 9000], ["dentistry", "bachelor", "tr", 8000], ["pharmacy", "bachelor", "tr", 5000], ["law", "bachelor", "tr", 3000], ["business-administration", "bachelor", "tr-en", 2500],
    ["economics", "bachelor", "tr-en", 2500], ["psychology", "bachelor", "tr", 2500], ["international-relations", "bachelor", "tr", 2200], ["english-language-teaching", "bachelor", "en", 2000], ["architecture", "bachelor", "tr", 2800],
    ["nursing", "bachelor", "tr", 2200], ["computer-engineering", "bachelor", "tr", 3000], ["mba", "master", "en", 4500], ["business-phd", "phd", "tr", 1500],
  ],
  "istanbul-university-cerrahpasa": [
    ["medicine", "bachelor", "tr-en", 9000], ["nursing", "bachelor", "tr", 2200], ["computer-engineering", "bachelor", "tr", 3000], ["electrical-electronics-engineering", "bachelor", "tr", 2800],
    ["civil-engineering", "bachelor", "tr", 2800], ["mechanical-engineering", "bachelor", "tr", 2800], ["industrial-engineering", "bachelor", "tr", 2800], ["physiotherapy", "bachelor", "tr", 2500],
  ],
  "marmara-university": [
    ["medicine", "bachelor", "en", 8000], ["dentistry", "bachelor", "tr-en", 7000], ["pharmacy", "bachelor", "tr", 4500], ["law", "bachelor", "tr", 2800], ["business-administration", "bachelor", "en", 2800],
    ["economics", "bachelor", "en", 2500], ["international-trade", "bachelor", "en", 2500], ["psychology", "bachelor", "tr", 2200], ["computer-engineering", "bachelor", "en", 3200],
    ["electrical-electronics-engineering", "bachelor", "en", 3000], ["mechanical-engineering", "bachelor", "en", 3000], ["industrial-engineering", "bachelor", "en", 3000], ["english-language-teaching", "bachelor", "en", 2000],
    ["nursing", "bachelor", "tr", 2000], ["film-television", "bachelor", "tr", 2200], ["mba", "master", "en", 4000],
  ],
  "yildiz-technical-university": [
    ["computer-engineering", "bachelor", "tr-en", 3500], ["electrical-electronics-engineering", "bachelor", "tr-en", 3200], ["mechanical-engineering", "bachelor", "tr-en", 3200], ["civil-engineering", "bachelor", "tr-en", 3000],
    ["industrial-engineering", "bachelor", "tr-en", 3000], ["chemical-engineering", "bachelor", "tr", 2800], ["architecture", "bachelor", "tr", 3000], ["business-administration", "bachelor", "tr", 2200],
    ["economics", "bachelor", "tr", 2000], ["computer-engineering-msc", "master", "en", 2000],
  ],
  "galatasaray-university": [
    ["law", "bachelor", "tr", 4000], ["business-administration", "bachelor", "tr", 3500], ["economics", "bachelor", "tr", 3500], ["international-relations", "bachelor", "tr", 3500], ["computer-engineering", "bachelor", "tr", 4000], ["industrial-engineering", "bachelor", "tr", 4000],
  ],
  "mimar-sinan-fine-arts-university": [
    ["architecture", "bachelor", "tr", 3000], ["interior-architecture", "bachelor", "tr", 2800], ["industrial-design", "bachelor", "tr", 2800], ["graphic-design", "bachelor", "tr", 2500], ["film-television", "bachelor", "tr", 2500],
  ],
  "istanbul-medeniyet-university": [
    ["medicine", "bachelor", "tr-en", 7000], ["dentistry", "bachelor", "tr", 6000], ["computer-engineering", "bachelor", "en", 2800], ["electrical-electronics-engineering", "bachelor", "en", 2600], ["business-administration", "bachelor", "en", 2000], ["international-relations", "bachelor", "en", 1800], ["psychology", "bachelor", "tr", 1800],
  ],
  "turkish-german-university": [
    ["computer-engineering", "bachelor", "tr", 3500], ["mechanical-engineering", "bachelor", "tr", 3500], ["electrical-electronics-engineering", "bachelor", "tr", 3500], ["law", "bachelor", "tr", 3000], ["business-administration", "bachelor", "tr", 3000], ["economics", "bachelor", "tr", 3000],
  ],
  "koc-university": [
    ["medicine", "bachelor", "en", 35000], ["computer-engineering", "bachelor", "en", 22000], ["electrical-electronics-engineering", "bachelor", "en", 22000], ["mechanical-engineering", "bachelor", "en", 22000],
    ["industrial-engineering", "bachelor", "en", 22000], ["chemical-engineering", "bachelor", "en", 22000], ["business-administration", "bachelor", "en", 20000], ["economics", "bachelor", "en", 20000],
    ["law", "bachelor", "en", 20000], ["psychology", "bachelor", "en", 19000], ["international-relations", "bachelor", "en", 19000], ["nursing", "bachelor", "en", 19000], ["molecular-biology", "bachelor", "en", 20000],
    ["mba", "master", "en", 30000], ["computer-engineering-msc", "master", "en", 12000], ["computer-engineering-phd", "phd", "en", 0],
  ],
  "sabanci-university": [
    ["computer-engineering", "bachelor", "en", 24000], ["electrical-electronics-engineering", "bachelor", "en", 24000], ["mechanical-engineering", "bachelor", "en", 24000], ["industrial-engineering", "bachelor", "en", 24000],
    ["molecular-biology", "bachelor", "en", 24000], ["business-administration", "bachelor", "en", 22000], ["economics", "bachelor", "en", 22000], ["psychology", "bachelor", "en", 21000], ["international-relations", "bachelor", "en", 21000],
    ["mba", "master", "en", 26000], ["data-science-msc", "master", "en", 14000], ["computer-engineering-phd", "phd", "en", 0],
  ],
  "ozyegin-university": [
    ["computer-engineering", "bachelor", "en", 18000], ["electrical-electronics-engineering", "bachelor", "en", 18000], ["mechanical-engineering", "bachelor", "en", 18000], ["civil-engineering", "bachelor", "en", 17000], ["industrial-engineering", "bachelor", "en", 18000],
    ["business-administration", "bachelor", "en", 16000], ["economics", "bachelor", "en", 15000], ["international-trade", "bachelor", "en", 15000], ["law", "bachelor", "tr", 15000], ["psychology", "bachelor", "en", 15000],
    ["architecture", "bachelor", "en", 17000], ["interior-architecture", "bachelor", "en", 16000], ["tourism-management", "bachelor", "en", 14000], ["gastronomy", "bachelor", "en", 14000], ["pilot-training", "bachelor", "en", 20000], ["mba", "master", "en", 18000],
  ],
  "bilgi-university": [
    ["computer-engineering", "bachelor", "en", 11000], ["electrical-electronics-engineering", "bachelor", "en", 11000], ["industrial-engineering", "bachelor", "en", 11000], ["civil-engineering", "bachelor", "en", 10000], ["mechanical-engineering", "bachelor", "en", 11000],
    ["business-administration", "bachelor", "en", 10000], ["economics", "bachelor", "en", 9500], ["international-trade", "bachelor", "en", 9500], ["international-relations", "bachelor", "en", 9500], ["psychology", "bachelor", "en", 10000],
    ["law", "bachelor", "tr", 12000], ["architecture", "bachelor", "en", 11000], ["interior-architecture", "bachelor", "en", 10000], ["industrial-design", "bachelor", "en", 10000], ["graphic-design", "bachelor", "tr-en", 9500],
    ["film-television", "bachelor", "en", 9500], ["new-media", "bachelor", "en", 9500], ["nursing", "bachelor", "tr", 7000], ["physiotherapy", "bachelor", "tr", 7500], ["tourism-management", "bachelor", "en", 8000],
    ["mba", "master", "en", 9000], ["clinical-psychology-ma", "master", "en", 8000], ["architecture-march", "master", "en", 8000],
  ],
  "bahcesehir-university": [
    ["medicine", "bachelor", "en", 25000], ["dentistry", "bachelor", "en", 22000], ["computer-engineering", "bachelor", "en", 12000], ["software-engineering", "bachelor", "en", 12000], ["artificial-intelligence", "bachelor", "en", 12500],
    ["electrical-electronics-engineering", "bachelor", "en", 11000], ["mechanical-engineering", "bachelor", "en", 11000], ["civil-engineering", "bachelor", "en", 10500], ["industrial-engineering", "bachelor", "en", 11000], ["biomedical-engineering", "bachelor", "en", 11000],
    ["business-administration", "bachelor", "en", 9500], ["economics", "bachelor", "en", 9000], ["international-trade", "bachelor", "en", 9000], ["law", "bachelor", "tr", 11000], ["psychology", "bachelor", "en", 9500],
    ["international-relations", "bachelor", "en", 9000], ["architecture", "bachelor", "en", 11000], ["interior-architecture", "bachelor", "en", 10000], ["industrial-design", "bachelor", "en", 9500], ["graphic-design", "bachelor", "en", 9000],
    ["film-television", "bachelor", "en", 9000], ["new-media", "bachelor", "en", 8500], ["nursing", "bachelor", "en", 8000], ["physiotherapy", "bachelor", "en", 8500], ["nutrition-dietetics", "bachelor", "en", 8000],
    ["english-language-teaching", "bachelor", "en", 8000], ["pilot-training", "bachelor", "en", 20000], ["mba", "master", "en", 9000], ["data-science-msc", "master", "en", 8000], ["clinical-psychology-ma", "master", "en", 8000], ["computer-engineering-phd", "phd", "en", 6000],
  ],
  "medipol-university": [
    ["medicine", "bachelor", "en", 30000], ["medicine", "bachelor", "tr", 26000], ["dentistry", "bachelor", "en", 25000], ["dentistry", "bachelor", "tr", 22000], ["pharmacy", "bachelor", "en", 15000],
    ["nursing", "bachelor", "en", 7000], ["physiotherapy", "bachelor", "en", 7000], ["nutrition-dietetics", "bachelor", "en", 6500], ["biomedical-engineering", "bachelor", "en", 7500], ["computer-engineering", "bachelor", "en", 7500],
    ["electrical-electronics-engineering", "bachelor", "en", 7000], ["civil-engineering", "bachelor", "en", 6500], ["industrial-engineering", "bachelor", "en", 7000], ["business-administration", "bachelor", "en", 6000], ["psychology", "bachelor", "en", 6500],
    ["law", "bachelor", "tr", 8000], ["architecture", "bachelor", "en", 7000], ["interior-architecture", "bachelor", "en", 6500], ["international-trade", "bachelor", "en", 5500], ["mba", "master", "en", 6000], ["clinical-psychology-ma", "master", "tr", 5500],
  ],
  "istanbul-aydin-university": [
    ["medicine", "bachelor", "en", 22000], ["dentistry", "bachelor", "en", 18000], ["nursing", "bachelor", "en", 5000], ["physiotherapy", "bachelor", "en", 5000], ["nutrition-dietetics", "bachelor", "en", 4500],
    ["computer-engineering", "bachelor", "en", 5500], ["software-engineering", "bachelor", "en", 5500], ["electrical-electronics-engineering", "bachelor", "en", 5000], ["mechanical-engineering", "bachelor", "en", 5000], ["civil-engineering", "bachelor", "en", 5000],
    ["industrial-engineering", "bachelor", "en", 5000], ["business-administration", "bachelor", "en", 4000], ["economics", "bachelor", "en", 4000], ["international-trade", "bachelor", "en", 4000], ["international-relations", "bachelor", "en", 4000],
    ["psychology", "bachelor", "en", 4500], ["law", "bachelor", "tr", 6000], ["architecture", "bachelor", "en", 5000], ["interior-architecture", "bachelor", "en", 4500], ["graphic-design", "bachelor", "en", 4000],
    ["film-television", "bachelor", "tr", 4000], ["new-media", "bachelor", "en", 4000], ["english-language-teaching", "bachelor", "en", 4000], ["tourism-management", "bachelor", "en", 4000], ["gastronomy", "bachelor", "tr", 4500],
    ["pilot-training", "bachelor", "en", 18000], ["mba", "master", "en", 5000], ["computer-engineering-msc", "master", "en", 4500], ["business-phd", "phd", "en", 5000],
  ],
  "istanbul-kultur-university": [
    ["computer-engineering", "bachelor", "en", 7000], ["electrical-electronics-engineering", "bachelor", "en", 6500], ["civil-engineering", "bachelor", "en", 6500], ["industrial-engineering", "bachelor", "en", 6500],
    ["business-administration", "bachelor", "en", 5500], ["economics", "bachelor", "en", 5500], ["international-trade", "bachelor", "en", 5500], ["law", "bachelor", "tr", 8000], ["psychology", "bachelor", "tr", 6000],
    ["architecture", "bachelor", "en", 7000], ["interior-architecture", "bachelor", "tr", 6000], ["nursing", "bachelor", "tr", 5500], ["physiotherapy", "bachelor", "tr", 5500], ["mba", "master", "en", 5000],
  ],
  "istanbul-okan-university": [
    ["medicine", "bachelor", "en", 20000], ["dentistry", "bachelor", "en", 17000], ["nursing", "bachelor", "tr", 4500], ["physiotherapy", "bachelor", "tr", 4500], ["computer-engineering", "bachelor", "en", 5500], ["software-engineering", "bachelor", "en", 5500],
    ["electrical-electronics-engineering", "bachelor", "en", 5000], ["mechanical-engineering", "bachelor", "en", 5000], ["civil-engineering", "bachelor", "en", 5000], ["industrial-engineering", "bachelor", "en", 5000], ["business-administration", "bachelor", "en", 4000],
    ["international-trade", "bachelor", "en", 4000], ["psychology", "bachelor", "en", 4500], ["law", "bachelor", "tr", 6000], ["architecture", "bachelor", "en", 5500], ["interior-architecture", "bachelor", "tr", 4500], ["gastronomy", "bachelor", "tr", 5000], ["mba", "master", "en", 4500],
  ],
  "altinbas-university": [
    ["medicine", "bachelor", "en", 19000], ["dentistry", "bachelor", "en", 16000], ["pharmacy", "bachelor", "en", 10000], ["nursing", "bachelor", "en", 4500], ["physiotherapy", "bachelor", "en", 4500],
    ["computer-engineering", "bachelor", "en", 5000], ["software-engineering", "bachelor", "en", 5000], ["electrical-electronics-engineering", "bachelor", "en", 4800], ["civil-engineering", "bachelor", "en", 4800], ["industrial-engineering", "bachelor", "en", 4800],
    ["business-administration", "bachelor", "en", 4000], ["international-trade", "bachelor", "en", 4000], ["international-relations", "bachelor", "en", 4000], ["psychology", "bachelor", "en", 4500], ["law", "bachelor", "tr", 6000],
    ["architecture", "bachelor", "en", 5000], ["interior-architecture", "bachelor", "en", 4500], ["mba", "master", "en", 4500], ["business-phd", "phd", "en", 5000],
  ],
  "istinye-university": [
    ["medicine", "bachelor", "en", 28000], ["dentistry", "bachelor", "en", 24000], ["pharmacy", "bachelor", "en", 14000], ["nursing", "bachelor", "en", 6000], ["physiotherapy", "bachelor", "en", 6000], ["nutrition-dietetics", "bachelor", "en", 5500],
    ["computer-engineering", "bachelor", "en", 7000], ["software-engineering", "bachelor", "en", 7000], ["electrical-electronics-engineering", "bachelor", "en", 6500], ["industrial-engineering", "bachelor", "en", 6500], ["biomedical-engineering", "bachelor", "en", 6500],
    ["business-administration", "bachelor", "en", 5500], ["economics", "bachelor", "en", 5000], ["international-trade", "bachelor", "en", 5000], ["psychology", "bachelor", "en", 6000], ["architecture", "bachelor", "en", 6500], ["molecular-biology", "bachelor", "en", 6000], ["mba", "master", "en", 6000],
  ],
  "kadir-has-university": [
    ["computer-engineering", "bachelor", "en", 13000], ["electrical-electronics-engineering", "bachelor", "en", 12500], ["industrial-engineering", "bachelor", "en", 12500], ["civil-engineering", "bachelor", "en", 12000], ["mechanical-engineering", "bachelor", "en", 12500],
    ["business-administration", "bachelor", "en", 11000], ["economics", "bachelor", "en", 10500], ["international-trade", "bachelor", "en", 10500], ["international-relations", "bachelor", "en", 10500], ["psychology", "bachelor", "en", 11000],
    ["law", "bachelor", "tr", 12500], ["architecture", "bachelor", "en", 12500], ["interior-architecture", "bachelor", "en", 11500], ["industrial-design", "bachelor", "en", 11000], ["new-media", "bachelor", "en", 10500], ["film-television", "bachelor", "en", 10500], ["mba", "master", "en", 10000],
  ],
  "yeditepe-university": [
    ["medicine", "bachelor", "en", 30000], ["dentistry", "bachelor", "en", 26000], ["pharmacy", "bachelor", "en", 18000], ["nursing", "bachelor", "en", 10000], ["physiotherapy", "bachelor", "en", 10000], ["nutrition-dietetics", "bachelor", "en", 9500],
    ["computer-engineering", "bachelor", "en", 13000], ["electrical-electronics-engineering", "bachelor", "en", 12500], ["mechanical-engineering", "bachelor", "en", 12500], ["civil-engineering", "bachelor", "en", 12000], ["industrial-engineering", "bachelor", "en", 12500], ["biomedical-engineering", "bachelor", "en", 12500],
    ["business-administration", "bachelor", "en", 11000], ["economics", "bachelor", "en", 10500], ["international-trade", "bachelor", "en", 10500], ["law", "bachelor", "tr", 13000], ["psychology", "bachelor", "en", 11500], ["architecture", "bachelor", "en", 12500], ["interior-architecture", "bachelor", "en", 11500], ["mba", "master", "en", 12000],
  ],
  "acibadem-university": [
    ["medicine", "bachelor", "en", 32000], ["nursing", "bachelor", "en", 12000], ["physiotherapy", "bachelor", "en", 12000], ["nutrition-dietetics", "bachelor", "en", 12000], ["molecular-biology", "bachelor", "en", 13000], ["biomedical-engineering", "bachelor", "en", 14000], ["psychology", "bachelor", "en", 12500], ["pharmacy", "bachelor", "en", 20000],
  ],
  "uskudar-university": [
    ["medicine", "bachelor", "en", 20000], ["dentistry", "bachelor", "tr", 18000], ["psychology", "bachelor", "en", 6000], ["nursing", "bachelor", "tr", 4500], ["physiotherapy", "bachelor", "tr", 4500], ["nutrition-dietetics", "bachelor", "tr", 4500],
    ["computer-engineering", "bachelor", "en", 5500], ["software-engineering", "bachelor", "en", 5500], ["artificial-intelligence", "bachelor", "en", 6000], ["electrical-electronics-engineering", "bachelor", "en", 5000], ["biomedical-engineering", "bachelor", "en", 5500],
    ["molecular-biology", "bachelor", "en", 5500], ["business-administration", "bachelor", "tr", 4000], ["international-relations", "bachelor", "en", 4000], ["new-media", "bachelor", "tr", 4000], ["clinical-psychology-ma", "master", "tr", 5000],
  ],
  "beykent-university": [
    ["medicine", "bachelor", "en", 18000], ["dentistry", "bachelor", "tr", 15000], ["nursing", "bachelor", "tr", 4000], ["physiotherapy", "bachelor", "tr", 4000], ["computer-engineering", "bachelor", "en", 4500], ["software-engineering", "bachelor", "en", 4500],
    ["electrical-electronics-engineering", "bachelor", "en", 4200], ["civil-engineering", "bachelor", "en", 4200], ["mechanical-engineering", "bachelor", "en", 4200], ["industrial-engineering", "bachelor", "en", 4200], ["business-administration", "bachelor", "en", 3500],
    ["international-trade", "bachelor", "en", 3500], ["psychology", "bachelor", "en", 4000], ["law", "bachelor", "tr", 5500], ["architecture", "bachelor", "en", 4500], ["interior-architecture", "bachelor", "tr", 4000], ["mba", "master", "en", 4000],
  ],
  "maltepe-university": [
    ["medicine", "bachelor", "en", 16000], ["nursing", "bachelor", "tr", 4000], ["computer-engineering", "bachelor", "en", 4500], ["software-engineering", "bachelor", "en", 4500], ["electrical-electronics-engineering", "bachelor", "en", 4200], ["industrial-engineering", "bachelor", "en", 4200],
    ["business-administration", "bachelor", "en", 3500], ["international-trade", "bachelor", "en", 3500], ["psychology", "bachelor", "en", 4000], ["law", "bachelor", "tr", 5500], ["architecture", "bachelor", "en", 4500], ["film-television", "bachelor", "tr", 3800], ["mba", "master", "en", 4000],
  ],
  "isik-university": [
    ["computer-engineering", "bachelor", "en", 7500], ["software-engineering", "bachelor", "en", 7500], ["electrical-electronics-engineering", "bachelor", "en", 7000], ["mechanical-engineering", "bachelor", "en", 7000], ["civil-engineering", "bachelor", "en", 7000], ["industrial-engineering", "bachelor", "en", 7000],
    ["business-administration", "bachelor", "en", 6000], ["economics", "bachelor", "en", 6000], ["international-trade", "bachelor", "en", 6000], ["psychology", "bachelor", "en", 6500], ["architecture", "bachelor", "en", 7500], ["interior-architecture", "bachelor", "en", 6500], ["industrial-design", "bachelor", "en", 6500], ["mba", "master", "en", 6000],
  ],
  "nisantasi-university": [
    ["computer-engineering", "bachelor", "en", 4500], ["software-engineering", "bachelor", "en", 4500], ["electrical-electronics-engineering", "bachelor", "en", 4200], ["civil-engineering", "bachelor", "en", 4200], ["mechanical-engineering", "bachelor", "en", 4200], ["industrial-engineering", "bachelor", "en", 4200],
    ["business-administration", "bachelor", "en", 3500], ["international-trade", "bachelor", "en", 3500], ["psychology", "bachelor", "en", 4000], ["nursing", "bachelor", "tr", 3800], ["physiotherapy", "bachelor", "tr", 3800], ["architecture", "bachelor", "en", 4500],
    ["interior-architecture", "bachelor", "en", 4000], ["graphic-design", "bachelor", "tr", 3500], ["new-media", "bachelor", "en", 3500], ["tourism-management", "bachelor", "en", 3500], ["gastronomy", "bachelor", "tr", 4000], ["mba", "master", "en", 4000],
  ],
  "halic-university": [
    ["medicine", "bachelor", "tr", 18000], ["dentistry", "bachelor", "tr", 15000], ["nursing", "bachelor", "tr", 4000], ["physiotherapy", "bachelor", "tr", 4000], ["nutrition-dietetics", "bachelor", "tr", 3800], ["computer-engineering", "bachelor", "en", 4500],
    ["electrical-electronics-engineering", "bachelor", "en", 4200], ["industrial-engineering", "bachelor", "en", 4200], ["business-administration", "bachelor", "en", 3500], ["psychology", "bachelor", "tr", 4000], ["architecture", "bachelor", "en", 4500], ["interior-architecture", "bachelor", "tr", 4000], ["graphic-design", "bachelor", "tr", 3500],
  ],
  "fatih-sultan-mehmet-vakif-university": [
    ["computer-engineering", "bachelor", "tr", 4500], ["civil-engineering", "bachelor", "tr", 4200], ["electrical-electronics-engineering", "bachelor", "tr", 4200], ["architecture", "bachelor", "tr", 4500], ["interior-architecture", "bachelor", "tr", 4000],
    ["law", "bachelor", "tr", 6000], ["business-administration", "bachelor", "en", 3800], ["psychology", "bachelor", "tr", 4000], ["english-language-teaching", "bachelor", "en", 3500], ["graphic-design", "bachelor", "tr", 3500],
  ],
  "istanbul-gelisim-university": [
    ["computer-engineering", "bachelor", "en", 4000], ["software-engineering", "bachelor", "en", 4000], ["electrical-electronics-engineering", "bachelor", "en", 3800], ["civil-engineering", "bachelor", "en", 3800], ["mechanical-engineering", "bachelor", "en", 3800], ["industrial-engineering", "bachelor", "en", 3800],
    ["business-administration", "bachelor", "en", 3000], ["economics", "bachelor", "en", 3000], ["international-trade", "bachelor", "en", 3000], ["psychology", "bachelor", "en", 3500], ["nursing", "bachelor", "en", 3500], ["physiotherapy", "bachelor", "en", 3500],
    ["nutrition-dietetics", "bachelor", "en", 3200], ["architecture", "bachelor", "en", 4000], ["interior-architecture", "bachelor", "en", 3500], ["graphic-design", "bachelor", "tr", 3000], ["new-media", "bachelor", "en", 3000], ["tourism-management", "bachelor", "en", 3000], ["mba", "master", "en", 3500],
  ],
  "istanbul-arel-university": [
    ["computer-engineering", "bachelor", "en", 4000], ["electrical-electronics-engineering", "bachelor", "tr", 3800], ["civil-engineering", "bachelor", "tr", 3800], ["industrial-engineering", "bachelor", "en", 3800], ["business-administration", "bachelor", "en", 3000],
    ["international-trade", "bachelor", "en", 3000], ["psychology", "bachelor", "tr", 3500], ["nursing", "bachelor", "tr", 3500], ["physiotherapy", "bachelor", "tr", 3500], ["architecture", "bachelor", "tr", 4000], ["graphic-design", "bachelor", "tr", 3000], ["mba", "master", "en", 3500],
  ],
  "bezmialem-vakif-university": [
    ["medicine", "bachelor", "tr", 25000], ["dentistry", "bachelor", "tr", 20000], ["pharmacy", "bachelor", "tr", 12000], ["nursing", "bachelor", "tr", 6000], ["physiotherapy", "bachelor", "tr", 6000], ["nutrition-dietetics", "bachelor", "tr", 6000],
  ],
  "biruni-university": [
    ["medicine", "bachelor", "en", 22000], ["dentistry", "bachelor", "en", 19000], ["pharmacy", "bachelor", "en", 11000], ["nursing", "bachelor", "tr", 5000], ["physiotherapy", "bachelor", "en", 5000], ["nutrition-dietetics", "bachelor", "tr", 5000], ["molecular-biology", "bachelor", "en", 5500], ["biomedical-engineering", "bachelor", "en", 5500], ["computer-engineering", "bachelor", "en", 5500], ["psychology", "bachelor", "tr", 5000], ["english-language-teaching", "bachelor", "en", 5000],
  ],
  "dogus-university": [
    ["computer-engineering", "bachelor", "en", 5000], ["software-engineering", "bachelor", "en", 5000], ["electrical-electronics-engineering", "bachelor", "en", 4800], ["civil-engineering", "bachelor", "en", 4800], ["mechanical-engineering", "bachelor", "en", 4800], ["industrial-engineering", "bachelor", "en", 4800],
    ["business-administration", "bachelor", "en", 4000], ["economics", "bachelor", "en", 4000], ["international-trade", "bachelor", "en", 4000], ["psychology", "bachelor", "tr", 4500], ["law", "bachelor", "tr", 6000], ["architecture", "bachelor", "en", 5000], ["graphic-design", "bachelor", "tr", 4000], ["mba", "master", "en", 4500],
  ],
  "istanbul-ticaret-university": [
    ["computer-engineering", "bachelor", "en", 6500], ["industrial-engineering", "bachelor", "en", 6500], ["electrical-electronics-engineering", "bachelor", "en", 6000], ["business-administration", "bachelor", "en", 5500], ["economics", "bachelor", "en", 5500], ["international-trade", "bachelor", "en", 5500],
    ["international-relations", "bachelor", "en", 5000], ["law", "bachelor", "tr", 8000], ["psychology", "bachelor", "tr", 5500], ["architecture", "bachelor", "tr", 6000], ["mba", "master", "en", 5500],
  ],
  "istanbul-sabahattin-zaim-university": [
    ["computer-engineering", "bachelor", "en", 5000], ["software-engineering", "bachelor", "en", 5000], ["electrical-electronics-engineering", "bachelor", "en", 4800], ["industrial-engineering", "bachelor", "en", 4800], ["business-administration", "bachelor", "en", 4000], ["economics", "bachelor", "en", 4000],
    ["international-trade", "bachelor", "en", 4000], ["international-relations", "bachelor", "en", 4000], ["psychology", "bachelor", "en", 4500], ["english-language-teaching", "bachelor", "en", 4000], ["nursing", "bachelor", "tr", 4000], ["nutrition-dietetics", "bachelor", "tr", 4000], ["architecture", "bachelor", "en", 5000], ["mba", "master", "en", 4500],
  ],
  "piri-reis-university": [
    ["maritime-transportation", "bachelor", "en", 8000], ["mechanical-engineering", "bachelor", "en", 7500], ["electrical-electronics-engineering", "bachelor", "en", 7500], ["computer-engineering", "bachelor", "en", 7500], ["industrial-engineering", "bachelor", "en", 7500], ["business-administration", "bachelor", "en", 6000], ["international-trade", "bachelor", "en", 6000], ["economics", "bachelor", "en", 6000],
  ],
  "istanbul-yeni-yuzyil-university": [
    ["medicine", "bachelor", "tr", 20000], ["dentistry", "bachelor", "tr", 17000], ["pharmacy", "bachelor", "tr", 10000], ["nursing", "bachelor", "tr", 4500], ["physiotherapy", "bachelor", "tr", 4500], ["nutrition-dietetics", "bachelor", "tr", 4500], ["biomedical-engineering", "bachelor", "en", 5000], ["electrical-electronics-engineering", "bachelor", "en", 5000], ["business-administration", "bachelor", "tr", 4000], ["psychology", "bachelor", "tr", 4500], ["law", "bachelor", "tr", 6000],
  ],
  "istanbul-atlas-university": [
    ["medicine", "bachelor", "en", 22000], ["dentistry", "bachelor", "en", 19000], ["pharmacy", "bachelor", "en", 11000], ["nursing", "bachelor", "tr", 5000], ["physiotherapy", "bachelor", "en", 5000], ["nutrition-dietetics", "bachelor", "tr", 4800], ["computer-engineering", "bachelor", "en", 5500], ["software-engineering", "bachelor", "en", 5500], ["biomedical-engineering", "bachelor", "en", 5500], ["psychology", "bachelor", "en", 5000], ["business-administration", "bachelor", "en", 4500],
  ],
  "istanbul-kent-university": [
    ["dentistry", "bachelor", "en", 16000], ["nursing", "bachelor", "tr", 4000], ["physiotherapy", "bachelor", "en", 4200], ["nutrition-dietetics", "bachelor", "tr", 4000], ["psychology", "bachelor", "en", 4500], ["business-administration", "bachelor", "en", 3800], ["international-trade", "bachelor", "en", 3800], ["software-engineering", "bachelor", "en", 4500], ["gastronomy", "bachelor", "tr", 4000], ["tourism-management", "bachelor", "en", 3800], ["interior-architecture", "bachelor", "en", 4200],
  ],
  "istanbul-topkapi-university": [
    ["computer-engineering", "bachelor", "en", 4000], ["software-engineering", "bachelor", "en", 4000], ["business-administration", "bachelor", "en", 3000], ["international-trade", "bachelor", "en", 3000], ["psychology", "bachelor", "tr", 3500], ["architecture", "bachelor", "tr", 4000], ["interior-architecture", "bachelor", "tr", 3500], ["graphic-design", "bachelor", "tr", 3000], ["nursing", "bachelor", "tr", 3500], ["gastronomy", "bachelor", "tr", 3500], ["mba", "master", "en", 3500],
  ],
  "istanbul-esenyurt-university": [
    ["computer-engineering", "bachelor", "en", 3500], ["software-engineering", "bachelor", "en", 3500], ["electrical-electronics-engineering", "bachelor", "en", 3200], ["civil-engineering", "bachelor", "en", 3200], ["industrial-engineering", "bachelor", "en", 3200], ["business-administration", "bachelor", "en", 2800],
    ["international-trade", "bachelor", "en", 2800], ["psychology", "bachelor", "en", 3200], ["nursing", "bachelor", "tr", 3000], ["physiotherapy", "bachelor", "tr", 3000], ["architecture", "bachelor", "en", 3500], ["interior-architecture", "bachelor", "en", 3200], ["mba", "master", "en", 3000],
  ],
  "ibn-haldun-university": [
    ["psychology", "bachelor", "en", 9000], ["international-relations", "bachelor", "en", 8500], ["economics", "bachelor", "en", 8500], ["business-administration", "bachelor", "en", 8500], ["law", "bachelor", "tr", 10000], ["english-language-teaching", "bachelor", "en", 7000], ["clinical-psychology-ma", "master", "en", 7000],
  ],
  "istanbul-29-mayis-university": [
    ["psychology", "bachelor", "tr", 6000], ["economics", "bachelor", "en", 5500], ["international-relations", "bachelor", "en", 5500], ["english-language-teaching", "bachelor", "en", 5000], ["business-administration", "bachelor", "tr", 5000],
  ],
  "demiroglu-bilim-university": [
    ["medicine", "bachelor", "tr-en", 24000], ["nursing", "bachelor", "tr", 6000], ["physiotherapy", "bachelor", "tr", 6000], ["nutrition-dietetics", "bachelor", "tr", 6000],
  ],
  "fenerbahce-university": [
    ["computer-engineering", "bachelor", "en", 6000], ["software-engineering", "bachelor", "en", 6000], ["electrical-electronics-engineering", "bachelor", "en", 5500], ["business-administration", "bachelor", "en", 5000], ["international-trade", "bachelor", "en", 5000], ["psychology", "bachelor", "en", 5500],
    ["nursing", "bachelor", "tr", 5000], ["physiotherapy", "bachelor", "tr", 5000], ["nutrition-dietetics", "bachelor", "tr", 5000], ["new-media", "bachelor", "en", 5000], ["interior-architecture", "bachelor", "en", 5500], ["mba", "master", "en", 5000],
  ],
  "beykoz-university": [
    ["computer-engineering", "bachelor", "en", 4000], ["software-engineering", "bachelor", "en", 4000], ["industrial-engineering", "bachelor", "en", 3800], ["business-administration", "bachelor", "en", 3500], ["international-trade", "bachelor", "en", 3500], ["psychology", "bachelor", "tr", 3800], ["graphic-design", "bachelor", "tr", 3500], ["tourism-management", "bachelor", "en", 3500], ["gastronomy", "bachelor", "tr", 3800],
  ],
  "istanbul-galata-university": [
    ["business-administration", "bachelor", "en", 4000], ["international-trade", "bachelor", "en", 4000], ["psychology", "bachelor", "tr", 4500], ["nursing", "bachelor", "tr", 4200], ["physiotherapy", "bachelor", "tr", 4200], ["nutrition-dietetics", "bachelor", "tr", 4000], ["software-engineering", "bachelor", "en", 4500], ["graphic-design", "bachelor", "tr", 3800],
  ],
  "istanbul-rumeli-university": [
    ["nursing", "bachelor", "tr", 3500], ["physiotherapy", "bachelor", "tr", 3500], ["nutrition-dietetics", "bachelor", "tr", 3500], ["business-administration", "bachelor", "tr", 3000], ["international-trade", "bachelor", "en", 3000], ["computer-engineering", "bachelor", "tr", 3500], ["software-engineering", "bachelor", "en", 3500], ["psychology", "bachelor", "tr", 3500],
  ],
  "istanbul-health-and-technology-university": [
    ["medicine", "bachelor", "en", 20000], ["dentistry", "bachelor", "en", 17000], ["pharmacy", "bachelor", "en", 10000], ["nursing", "bachelor", "tr", 4500], ["physiotherapy", "bachelor", "en", 4500], ["nutrition-dietetics", "bachelor", "tr", 4500], ["computer-engineering", "bachelor", "en", 5000], ["software-engineering", "bachelor", "en", 5000], ["biomedical-engineering", "bachelor", "en", 5000], ["psychology", "bachelor", "en", 4800],
  ],
};

export const programs: Program[] = Object.entries(BY_UNI).flatMap(([uniSlug, rows]) =>
  rows.map(([slug, level, language, tuition]) => {
    const c = CAT[slug];
    if (!c) throw new Error(`Unknown program slug ${slug}`);
    return {
      id: `prog-${uniSlug}-${slug}-${language}`,
      university_id: `uni-${uniSlug}`,
      slug: `${slug}-${language}`,
      name: { fa: c.fa, en: c.en },
      level,
      faculty: c.fac,
      language,
      duration_years: c.years,
      tuition_usd: tuition,
      tuition_note: tuition === 0 ? { fa: "با بورسیه کامل (معافیت شهریه + حقوق ماهانه)", en: "Fully funded (tuition waiver + stipend)" } : null,
      category_id: c.cat,
    } satisfies Program;
  }),
);

export const programCatalogue = CAT;
