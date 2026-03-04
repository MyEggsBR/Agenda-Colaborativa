import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { getSystemConfig } from '@/lib/systemConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const config = await getSystemConfig();
  
  const iconUrl = config.logo_url 
    ? `${config.logo_url}?t=${Date.now()}` 
    : '/favicon.ico';

  return {
    title: config.system_name,
    description: 'Encontre a melhor data para todos.',
    icons: {
      icon: iconUrl,
    },
  };
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
