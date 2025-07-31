import Header from "@/components/Header";
import Hero from "@/components/Hero";
import GroupsSection from "@/components/GroupsSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <GroupsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
