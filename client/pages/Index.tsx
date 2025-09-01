import Header from "@/components/calmi/Header";
import Footer from "@/components/calmi/Footer";
import Hero from "@/components/calmi/Hero";
import ChatAssistant from "@/components/calmi/ChatAssistant";
import BreathingExercises from "@/components/calmi/BreathingExercises";
import Donate from "@/components/calmi/Donate";
import Hotlines from "@/components/calmi/Hotlines";
import Journal from "@/components/calmi/Journal";

export default function Index() {
  return (
    <div id="top" className="min-h-screen bg-gradient-to-br from-sky-50 via-emerald-50 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <Header />
      <main className="container mx-auto px-4">
        <Hero />
        <div className="grid gap-6">
          <ChatAssistant />
          <BreathingExercises />
          <Donate defaultEmail="annwangare36@gmail.com" />
          <Hotlines />
          <Journal />
        </div>
      </main>
      <Footer />
    </div>
  );
}
