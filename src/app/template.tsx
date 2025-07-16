import PageMotion from '@/components/animations/PageTransition';

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageMotion>{children}</PageMotion>;
}