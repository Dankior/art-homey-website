import {requestDb} from "@/db/requests";
const categories=["kitchen","storage","apartment","other"];
const budgets=["350–650 тыс. ₽","650 тыс.–1 млн ₽","Более 1 млн ₽","Хочу обсудить бюджет","До 150 000 ₽","150 000–300 000 ₽","300 000–500 000 ₽","От 500 000 ₽","Нужна консультация"];
export async function POST(request:Request){
 const origin=request.headers.get("Origin");if(origin&&origin!==new URL(request.url).origin)return Response.json({error:"Отправьте заявку со страницы сайта."},{status:403});
 if(!request.headers.get("Content-Type")?.includes("application/json"))return Response.json({error:"Неверный формат запроса."},{status:415});
 const raw=await request.text();if(raw.length>7000)return Response.json({error:"Описание слишком длинное."},{status:413});
 let p:Record<string,unknown>;try{p=JSON.parse(raw);if(!p||typeof p!=="object"||Array.isArray(p))throw new Error();}catch{return Response.json({error:"Неверный формат данных."},{status:400});}
 if(p.website)return Response.json({error:"Не удалось отправить заявку."},{status:400});
 const string=(x:unknown)=>typeof x==="string"?x.trim():"";
 const category=string(p.category),budget=string(p.budget),contact=string(p.contact),name=string(p.name),message=string(p.message);
 const phone=/^\+?[\d\s()\-]{7,25}$/.test(contact)&&contact.replace(/\D/g,"").length>=7;
 const email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
 if(!categories.includes(category)||!budgets.includes(budget)||p.consent!==true||(!phone&&!email)||contact.length>120||name.length>80||message.length>3000)return Response.json({error:"Проверьте телефон или email и согласие на обработку обращения."},{status:400});
 try{const id=crypto.randomUUID();await requestDb().prepare("INSERT INTO requests (id,category,budget,name,contact,message,consent_version,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(id,category,budget,name,contact,message,"2026-09-27",new Date().toISOString()).run();return Response.json({id},{status:201});}catch(error){console.error("Request storage failed",error instanceof Error?error.message:"unknown");return Response.json({error:"Сейчас не удалось сохранить заявку. Попробуйте ещё раз позже."},{status:503});}
}
