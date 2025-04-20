import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { ArrowRight, Plus, UserPlus, Link as LinkIcon, Calendar, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface LinkHub {
  id: string;
  username: string;
  theme: string;
  links: any[];
  created_at: string;
}

const Home = () => {
  const { isSignedIn, userId } = useAuth();
  const [userLinkHubs, setUserLinkHubs] = useState<LinkHub[]>([]);
  const [featuredLinkHubs, setFeaturedLinkHubs] = useState<LinkHub[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalLinks, setTotalLinks] = useState(0);

  useEffect(() => {
    fetchFeaturedLinkHubs();
    
    if (isSignedIn && userId) {
      fetchUserLinkHubs();
    } else {
      setIsLoading(false);
    }
  }, [isSignedIn, userId]);

  const fetchUserLinkHubs = async () => {
    try {
      setIsLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      if (data) {
        setUserLinkHubs(data as LinkHub[]);
        // Calculate total links across all user's LinkHubs
        const linkCount = data.reduce((acc, hub) => acc + (hub.links?.length || 0), 0);
        setTotalLinks(linkCount);
      } else {
        setUserLinkHubs([]);
      }
    } catch (error: any) {
      console.error('Error fetching LinkHubs:', error);
      setError('Failed to load your LinkHubs');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedLinkHubs = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .limit(3)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      if (data) {
        setFeaturedLinkHubs(data as LinkHub[]);
      }
    } catch (error: any) {
      console.error('Error fetching featured LinkHubs:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Welcome to LinkHub</h1>
        <p className="text-xl text-muted-foreground mb-6">
          Your personal collection of important links, organized beautifully.
        </p>
        <div className="flex justify-center">
          <Link to={isSignedIn ? "/create-linkhub" : "/sign-in"}>
            <Button className="flex items-center gap-2">
              <Plus size={18} />
              {isSignedIn ? "Create New LinkHub" : "Get Started"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Section for Signed-in Users */}
      {isSignedIn && userLinkHubs.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total LinkHubs</CardTitle>
              <p className="text-2xl font-bold">{userLinkHubs.length}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <UserPlus className="h-3 w-3 mr-1" />
                <span>Your personal link collections</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Links</CardTitle>
              <p className="text-2xl font-bold">{totalLinks}</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <LinkIcon className="h-3 w-3 mr-1" />
                <span>Links across all your hubs</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Most Recent</CardTitle>
              <p className="text-2xl font-bold">
                {userLinkHubs[0]?.username ? `@${userLinkHubs[0].username}` : "None"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Created {userLinkHubs[0]?.created_at ? formatDate(userLinkHubs[0].created_at) : "recently"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User's LinkHubs Section */}
      {isSignedIn && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Your LinkHubs</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card className="border-destructive/50">
              <CardContent className="pt-6">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : userLinkHubs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userLinkHubs.map((hub) => (
                <Link
                  key={hub.id}
                  to={`/profile/${hub.username}`}
                  className="block"
                >
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <CardTitle>@{hub.username}</CardTitle>
                        <ArrowRight className="text-muted-foreground" size={18} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 mb-3">
                        <span className="text-sm text-muted-foreground">
                          {hub.links?.length || 0} links
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary-foreground">
                          {hub.theme || 'dark'} theme
                        </span>
                      </div>
                      {hub.links && hub.links.length > 0 && (
                        <p className="text-sm text-muted-foreground truncate">
                          Latest: {hub.links[0].title}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground">
                      Created on {formatDate(hub.created_at)}
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <CardDescription className="mb-4">
                  You haven't created any LinkHubs yet.
                </CardDescription>
                <Link to="/create-linkhub">
                  <Button>Create Your First LinkHub</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Featured LinkHubs for Discovery */}
      {featuredLinkHubs.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-bold">Featured LinkHubs</h2>
            <Sparkles className="ml-2 text-primary" size={20} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredLinkHubs.map((hub) => (
              <Link
                key={hub.id}
                to={`/profile/${hub.username}`}
                className="block"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>@{hub.username}</CardTitle>
                      <ArrowRight className="text-muted-foreground" size={18} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {hub.links?.length || 0} links
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary-foreground">
                        {hub.theme || 'dark'} theme
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 