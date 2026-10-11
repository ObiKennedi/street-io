import Hero from "@/component/root/hero-section";
import ArticlesSection from "@/component/root/articles-section";
import AboutSection from "@/component/root/about-section";
import ContactSection from "@/component/root/contact-section";

export default function Home() {
    return (
        <main>
            <Hero />
            <ArticlesSection />
            <AboutSection />
            <ContactSection />
        </main>
    );
}