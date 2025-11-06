import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SearchResult {
  title: string;
  url: string;
  description: string;
  source: 'yandex' | 'google';
}

interface HistoryItem {
  url: string;
  title: string;
  timestamp: Date;
}

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const mockResults: SearchResult[] = [
      {
        title: `${searchQuery} - Yandex`,
        url: `https://yandex.ru/search/?text=${encodeURIComponent(searchQuery)}`,
        description: 'Результаты поиска из Яндекса',
        source: 'yandex'
      },
      {
        title: `${searchQuery} - Google`,
        url: `https://google.com/search?q=${encodeURIComponent(searchQuery)}`,
        description: 'Результаты поиска из Google',
        source: 'google'
      }
    ];

    setSearchResults(mockResults);
  };

  const handleResultClick = (result: SearchResult) => {
    setHistory(prev => [{
      url: result.url,
      title: result.title,
      timestamp: new Date()
    }, ...prev].slice(0, 50));
    window.open(result.url, '_blank');
  };

  const handleAuth = () => {
    setIsLoggedIn(true);
    setIsAuthOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            <span className="text-foreground">Sir</span>
            <span className="text-primary">i</span>
            <span className="text-foreground">Us</span>
          </div>
        </div>
        
        {!isLoggedIn ? (
          <Button 
            variant="ghost" 
            onClick={() => setIsAuthOpen(true)}
            className="hover:bg-secondary"
          >
            Войти
          </Button>
        ) : (
          <Button variant="ghost" className="hover:bg-secondary">
            <Icon name="User" size={20} />
          </Button>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-2xl mb-12">
          <h1 className="text-6xl font-bold text-center mb-12">
            <span className="text-foreground">Sir</span>
            <span className="text-primary">i</span>
            <span className="text-foreground">Us</span>
          </h1>

          <div className="relative">
            <Input
              type="text"
              placeholder="Поиск в Яндекс и Google"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-14 pr-14 text-lg border-2 border-border rounded-full focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
              size="icon"
            >
              <Icon name="Search" size={20} />
            </Button>
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="w-full max-w-3xl space-y-4 animate-fade-in">
            {searchResults.map((result, index) => (
              <Card
                key={index}
                className="p-5 hover:shadow-lg transition-all cursor-pointer border-l-4"
                style={{
                  borderLeftColor: result.source === 'yandex' ? '#FF0000' : '#4285F4'
                }}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start gap-3">
                  <Icon 
                    name={result.source === 'yandex' ? 'Compass' : 'Globe'} 
                    size={24}
                    className="mt-1 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-foreground hover:text-primary transition-colors">
                      {result.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{result.url}</p>
                    <p className="text-sm text-muted-foreground mt-2">{result.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border px-6 py-4 flex items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsHistoryOpen(true)}
          className="rounded-full hover:bg-secondary"
        >
          <Icon name="MoreHorizontal" size={24} />
        </Button>
      </footer>

      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">История посещений</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px] pr-4">
            {history.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Icon name="History" size={48} className="mx-auto mb-4 opacity-50" />
                <p>История пуста</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <Card
                    key={index}
                    className="p-4 hover:bg-secondary cursor-pointer transition-colors"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <h4 className="font-medium text-foreground">{item.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.url}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {item.timestamp.toLocaleString('ru-RU')}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {isRegistering ? 'Регистрация' : 'Вход'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="example@mail.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="password-confirm">Подтвердите пароль</Label>
                <Input id="password-confirm" type="password" placeholder="••••••••" />
              </div>
            )}
            <Button 
              onClick={handleAuth}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isRegistering ? 'Зарегистрироваться' : 'Войти'}
            </Button>
            <Button
              variant="link"
              className="w-full text-muted-foreground"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
