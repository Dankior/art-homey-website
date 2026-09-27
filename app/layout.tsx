import type {Metadata} from "next";
import "./globals.css";
export const metadata:Metadata={title:"ART HOMEY — корпусная мебель на заказ",description:"ART HOMEY — индивидуальные кухни, шкафы и гардеробные в Москве и области. Обсудите планировку, материалы и расчёт проекта.",icons:{icon:"/favicon.svg",shortcut:"/favicon.svg"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ru"><body>{children}</body></html>;}
