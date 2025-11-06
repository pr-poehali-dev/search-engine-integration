import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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

const SEARCH_API_URL = 'https://functions.poehali.dev/cf70c0c1-0fcc-422b-8f19-1a6f4465584d';

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SearchResult | null>(null);
  const [isSiteViewOpen, setIsSiteViewOpen] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch(SEARCH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      });

      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([
        {
          title: 'Ошибка поиска',
          url: '',
          description: 'Не удалось выполнить поиск. Попробуйте позже.',
          source: 'google'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    setHistory(prev => [{
      url: result.url,
      title: result.title,
      timestamp: new Date()
    }, ...prev].slice(0, 50));
    
    setSelectedSite(result);
    setIsSiteViewOpen(true);
  };

  const handleAuth = () => {
    setIsLoggedIn(true);
    setIsAuthOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-background z-10">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold">
            <span className="text-foreground">Sir</span>
            <span className="text-primary">i</span>
            <span className="text-foreground">Us</span>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-8">
          {searchResults.length > 0 && (
            <div className="relative">
              <Input
                type="text"
                placeholder="Поиск в Яндекс и Google"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-10 pr-12 border-2 border-border rounded-full focus-visible:ring-2 focus-visible:ring-primary"
              />
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-8"
                size="icon"
              >
                <Icon name={isLoading ? "Loader2" : "Search"} size={16} className={isLoading ? "animate-spin" : ""} />
              </Button>
            </div>
          )}
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

      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {searchResults.length === 0 ? (
          <div className="w-full max-w-2xl mt-32">
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
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                size="icon"
              >
                <Icon name={isLoading ? "Loader2" : "Search"} size={20} className={isLoading ? "animate-spin" : ""} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-3 animate-fade-in">
            {searchResults.map((result, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-md transition-all cursor-pointer border-l-4"
                style={{
                  borderLeftColor: result.source === 'yandex' ? '#FF0000' : '#4285F4'
                }}
                onClick={() => handleResultClick(result)}
              >
                <div className="flex items-start gap-3">
                  <Icon 
                    name="Globe"
                    size={20}
                    className="mt-1 flex-shrink-0 text-muted-foreground"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-medium text-primary hover:underline truncate">
                        {result.title}
                      </h3>
                      <Badge variant="outline" className="text-xs">
                        {result.source === 'google' ? 'Google' : 'Yandex'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 truncate">{result.url}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{result.description}</p>
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

      <Dialog open={isSiteViewOpen} onOpenChange={setIsSiteViewOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b bg-background">
              <div className="flex-1 min-w-0 mr-4">
                <h3 className="font-semibold text-lg truncate">{selectedSite?.title}</h3>
                <a 
                  href={selectedSite?.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate block"
                >
                  {selectedSite?.url}
                </a>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedSite?.url, '_blank')}
                >
                  <Icon name="ExternalLink" size={16} className="mr-2" />
                  Открыть
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSiteViewOpen(false)}
                >
                  <Icon name="X" size={20} />
                </Button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              {selectedSite?.url && (
                <iframe
                  src={selectedSite.url}
                  className="w-full h-full border-0"
                  title={selectedSite.title}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                    onClick={() => {
                      setSelectedSite({
                        title: item.title,
                        url: item.url,
                        description: '',
                        source: 'google'
                      });
                      setIsSiteViewOpen(true);
                      setIsHistoryOpen(false);
                    }}
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
