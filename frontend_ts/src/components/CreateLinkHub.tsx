import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { PlusCircle, X, Link as LinkIcon, AlertCircle } from 'lucide-react';
import ThemeSelector, { themes } from './ThemeSelector';

interface Link {
  id: number;
  title: string;
  url: string;
  category: string;
}

const CreateLinkHub = () => {
  const [username, setUsername] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [newLink, setNewLink] = useState<Omit<Link, 'id'>>({ title: '', url: '', category: '' });
  const [theme, setTheme] = useState('dark');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const { userId, isSignedIn, isLoaded } = useAuth();
  const navigate = useNavigate();

  const categories = ['Projects', 'Clubs', 'Research', 'Social Media', 'Education', 'Work', 'Personal', 'Other'];

  const validateUrl = (url: string) => {
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      new URL(url);
      return url;
    } catch {
      return false;
    }
  };

  const validateUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9-]{3,30}$/;
    return regex.test(username);
  };

  const handleUsernameChange = async (value: string) => {
    const newUsername = value.toLowerCase();
    setUsername(newUsername);
    
    if (newUsername.length >= 3 && validateUsername(newUsername)) {
      setIsCheckingUsername(true);
      setUsernameAvailable(null);
      
      try {
        const { data, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', newUsername);

        if (checkError) throw checkError;
        
        const isAvailable = !data || data.length === 0;
        setUsernameAvailable(isAvailable);
      } catch (err) {
        console.error('Error checking username:', err);
        setUsernameAvailable(null);
      } finally {
        setIsCheckingUsername(false);
      }
    } else {
      setUsernameAvailable(null);
    }
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url) {
      setError('Title and URL are required');
      return;
    }

    const validatedUrl = validateUrl(newLink.url);
    if (!validatedUrl) {
      setError('Please enter a valid URL');
      return;
    }

    setLinks([...links, { ...newLink, url: validatedUrl, id: Date.now() }]);
    setNewLink({ title: '', url: '', category: '' });
    setError('');
  };

  const handleRemoveLink = (id: number) => {
    setLinks(links.filter(link => link.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateUsername(username)) {
      setError('Username must be 3-30 characters long and can only contain letters, numbers, and hyphens');
      return;
    }

    if (!isSignedIn || !userId) {
      setError('You must be signed in to create a LinkHub');
      return;
    }

    if (links.length === 0) {
      setError('Please add at least one link');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data: existing, error: checkError } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username);

      if (checkError) throw checkError;
      
      if (existing && existing.length > 0) {
        setError('Username already taken');
        setIsLoading(false);
        return;
      }

      const { error: createError } = await supabase
        .from('profiles')
        .insert([
          {
            username,
            user_id: userId,
            links,
            theme,
            created_at: new Date().toISOString()
          }
        ]);

      if (createError) throw createError;

      navigate(`/profile/${username}`);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to create LinkHub. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your LinkHub</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-1">
                Choose a username
              </label>
              <div className="relative">
                <div className="flex items-center">
                  <span className="absolute left-3 text-muted-foreground">@</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    className={`w-full p-2 pl-8 bg-input border border-input rounded-lg text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent ${
                      usernameAvailable === true ? 'border-green-500' : 
                      usernameAvailable === false ? 'border-destructive' : ''
                    }`}
                    placeholder="your-username"
                    required
                    minLength={3}
                    maxLength={30}
                  />
                  {isCheckingUsername && (
                    <div className="absolute right-3">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                  {usernameAvailable === true && (
                    <div className="absolute right-3 text-green-500">✓</div>
                  )}
                  {usernameAvailable === false && (
                    <div className="absolute right-3 text-destructive">
                      <AlertCircle size={16} />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                3-30 characters, letters, numbers, and hyphens only
              </p>
              {usernameAvailable === false && (
                <p className="text-sm text-destructive mt-1">
                  This username is already taken
                </p>
              )}
            </div>

            <ThemeSelector selectedTheme={theme} onThemeChange={setTheme} />

            <div className="space-y-4">
              <h2 className="text-lg font-medium flex items-center">
                <LinkIcon className="mr-2 h-5 w-5" />
                Add Links ({links.length})
              </h2>
              
              <div className="space-y-3 bg-accent/10 p-4 rounded-lg">
                <input
                  type="text"
                  value={newLink.title}
                  onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  placeholder="Link Title"
                  className="w-full p-2 bg-input border border-input rounded"
                />
                <input
                  type="text"
                  value={newLink.url}
                  onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                  placeholder="URL (https://...)"
                  className="w-full p-2 bg-input border border-input rounded"
                />
                
                <select
                  value={newLink.category}
                  onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                  className="w-full p-2 bg-input border border-input rounded"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <Button
                  type="button"
                  onClick={handleAddLink}
                  className="w-full"
                  variant="default"
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add Link
                </Button>
              </div>

              {links.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium">Added Links:</h3>
                  <div className="max-h-72 overflow-y-auto pr-2">
                    {links.map(link => (
                      <div key={link.id} className="flex justify-between items-center bg-accent/10 p-3 rounded mb-2">
                        <div>
                          <div>{link.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">{link.url}</div>
                          {link.category && (
                            <span className="text-xs bg-accent/20 px-2 py-0.5 rounded mt-1 inline-block">
                              {link.category}
                            </span>
                          )}
                        </div>
                        <Button
                          type="button"
                          onClick={() => handleRemoveLink(link.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive text-destructive p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isLoading || (username.length >= 3 && usernameAvailable === false)}
              className="w-full"
            >
              {isLoading ? 'Creating...' : 'Create LinkHub'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLinkHub; 