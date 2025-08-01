import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import GroupsSection from '@/components/GroupsSection';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <GroupsSection />
      <Footer />
    </div>
  );
};

export default Index;
