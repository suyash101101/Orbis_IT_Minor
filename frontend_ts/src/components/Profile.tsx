import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { supabase } from '@/lib/supabase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Edit, Trash2, GripVertical, Share2, ExternalLink, Share, Clock, Search } from 'lucide-react';
import { toast } from './ui/use-toast';
import { themes } from './ThemeSelector';

interface Link {
  id: number;
  title: string;
  url: string;
  category: string;
}

interface EditingLink extends Link {
  tempTitle: string;
  tempUrl: string;
  tempCategory: string;
}

interface ProfileData {
  id: string;
  username: string;
  user_id: string;
  links: Link[];
  theme: string;
  created_at: string;
}

interface SortableLinkProps {
  link: Link;
  isOwner: boolean;
  onEdit: (link: Link) => void;
  onDelete: (id: number) => void;
}

const SortableLink = ({ link, isOwner, onEdit, onDelete }: SortableLinkProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`mb-3 ${isDragging ? 'shadow-lg' : ''}`}
      {...attributes}
    >
      <CardContent className="p-4 flex items-center gap-2">
        {isOwner && (
          <div {...listeners} className="cursor-move text-muted-foreground">
            <GripVertical size={20} />
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{link.title}</h3>
          <a 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary break-all block mb-1 flex items-center"
          >
            {link.url}
            <ExternalLink size={14} className="ml-1" />
          </a>
          {link.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground">
              {link.category}
            </span>
          )}
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button
              onClick={() => onEdit(link)}
              variant="outline"
              size="sm"
              className="text-muted-foreground"
            >
              <Edit size={16} />
            </Button>
            <Button
              onClick={() => onDelete(link.id)}
              variant="outline"
              size="sm"
              className="text-destructive"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
};

const Profile = () => {
  const { username } = useParams<{ username: string }>();
  const { userId, isSignedIn } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editingLink, setEditingLink] = useState<EditingLink | null>(null);
  const [error, setError] = useState('');
  const [newLink, setNewLink] = useState<Omit<Link, 'id'>>({ title: '', url: '', category: '' });
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('title');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const navigate = useNavigate();

  const categories = ['Projects', 'Clubs', 'Research', 'Social Media', 'Others'];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor)
  );

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  useEffect(() => {
    if (profile && userId) {
      setIsOwner(profile.user_id === userId);
    }
  }, [profile, userId]);

  useEffect(() => {
    if (profile?.links) {
      let filtered = [...profile.links];
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.filter((link) =>
          link[filterBy as keyof Link]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filter by category
      if (categoryFilter) {
        filtered = filtered.filter(link => link.category === categoryFilter);
      }
      
      setFilteredLinks(filtered);
    }
  }, [searchTerm, filterBy, categoryFilter, profile?.links]);

  useEffect(() => {
    // Apply theme to the profile container if profile is loaded
    if (profile?.theme) {
      // Find the theme object from our themes array
      const selectedTheme = themes.find(t => t.id === profile.theme);
      
      if (selectedTheme) {
        const root = document.documentElement;
        
        // Apply theme colors to CSS variables
        root.style.setProperty('--profile-primary', selectedTheme.primary);
        root.style.setProperty('--profile-secondary', selectedTheme.secondary);
        root.style.setProperty('--profile-accent', selectedTheme.accent);
        root.style.setProperty('--profile-background', selectedTheme.background || selectedTheme.primary);
        root.style.setProperty('--profile-text', selectedTheme.text || '#ffffff');
        root.style.setProperty('--profile-contrast-text', selectedTheme.contrastText || selectedTheme.text || '#ffffff');
      }
    }
    
    // Cleanup function to reset variables when component unmounts
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--profile-primary');
      root.style.removeProperty('--profile-secondary');
      root.style.removeProperty('--profile-accent');
      root.style.removeProperty('--profile-background');
      root.style.removeProperty('--profile-text');
      root.style.removeProperty('--profile-contrast-text');
    };
  }, [profile?.theme]);

  const fetchProfile = async () => {
    if (!username) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) throw error;
      setProfile(data);
      setFilteredLinks(data.links || []);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url || !profile) return;

    try {
      const updatedLinks = [...(profile.links || []), { ...newLink, id: Date.now() }];
      
      const { error } = await supabase
        .from('profiles')
        .update({ links: updatedLinks })
        .eq('username', username);

      if (error) throw error;

      setProfile({ ...profile, links: updatedLinks });
      setFilteredLinks(updatedLinks);
      setNewLink({ title: '', url: '', category: '' });
    } catch (err: any) {
      console.error('Error adding link:', err);
      setError('Failed to add link');
    }
  };

  const handleEditLink = (link: Link) => {
    setEditingLink({
      ...link,
      tempTitle: link.title,
      tempUrl: link.url,
      tempCategory: link.category
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLink || !profile) return;
    
    try {
      const updatedLinks = profile.links.map(link =>
        link.id === editingLink.id
          ? {
              ...link,
              title: editingLink.tempTitle,
              url: editingLink.tempUrl,
              category: editingLink.tempCategory
            }
          : link
      );

      const { error } = await supabase
        .from('profiles')
        .update({ links: updatedLinks })
        .eq('username', username);

      if (error) throw error;

      setProfile({ ...profile, links: updatedLinks });
      setFilteredLinks(updatedLinks);
      setEditingLink(null);
    } catch (err: any) {
      console.error('Error saving edit:', err);
      setError('Failed to save changes');
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!profile) return;
    
    try {
      const updatedLinks = profile.links.filter(link => link.id !== linkId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ links: updatedLinks })
        .eq('username', username);

      if (error) throw error;

      setProfile({ ...profile, links: updatedLinks });
      setFilteredLinks(updatedLinks);
    } catch (err: any) {
      console.error('Error deleting link:', err);
      setError('Failed to delete link');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!profile) return;
    
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const oldIndex = profile.links.findIndex((link) => link.id === active.id);
      const newIndex = profile.links.findIndex((link) => link.id === over?.id);
      
      const newLinks = arrayMove(profile.links, oldIndex, newIndex);
      
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ links: newLinks })
          .eq('username', username);

        if (error) throw error;

        setProfile({ ...profile, links: newLinks });
        setFilteredLinks(newLinks);
      } catch (err: any) {
        console.error('Error reordering links:', err);
        setError('Failed to reorder links');
      }
    }
  };

  const handleShareProfile = async () => {
    const profileUrl = `${window.location.origin}/profile/${username}`;
    
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast({
        title: "URL Copied!",
        description: "Profile link copied to clipboard",
      });
    } catch (err) {
      console.error('Failed to copy URL:', err);
      toast({
        title: "Error",
        description: "Failed to copy URL to clipboard",
      });
    }
  };

  const handleEditProfile = () => {
    navigate(`/edit-profile/${username}`);
  };

  if (!profile) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  const bgStyle = profile.theme ? {
    background: 'var(--profile-background, var(--background))',
    color: 'var(--profile-text, var(--foreground))'
  } : {};

  const cardStyle = profile.theme ? {
    background: 'var(--profile-primary, var(--card))',
    borderColor: 'var(--profile-secondary, var(--border))'
  } : {};
  
  const accentStyle = profile.theme ? {
    color: 'var(--profile-accent, var(--primary))'
  } : {};

  const categorizedLinks = profile.links.reduce((acc: Record<string, Link[]>, link) => {
    const category = link.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {});

  // If search is active, filter the links
  let displayedLinks = profile.links;
  if (searchTerm) {
    displayedLinks = profile.links.filter(link => 
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      link.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (link.category && link.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Reorganize links by category
  const displayedCategorizedLinks = displayedLinks.reduce((acc: Record<string, Link[]>, link) => {
    const category = link.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(link);
    return acc;
  }, {});

  const sortedCategories = Object.keys(displayedCategorizedLinks).sort();

  return (
    <div className="min-h-screen p-6" style={bgStyle}>
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border" style={cardStyle}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">@{profile.username}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Clock className="w-4 h-4 mr-1" />
                  {profile.created_at ? 
                    `Created ${formatRelativeTime(profile.created_at)}` : 
                    'Recently created'}
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShareProfile}
                  title="Copy link to clipboard"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                {isOwner && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEditProfile}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {shareMessage && (
              <div className="mb-4 p-2 bg-secondary/50 rounded text-center">
                {shareMessage}
              </div>
            )}
            
            {/* Search box */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search links..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 pl-10 pr-4 rounded-md border border-input bg-background"
                  style={{ color: 'var(--profile-text, var(--foreground))' }}
                />
              </div>
            </div>

            {sortedCategories.length > 0 ? (
              sortedCategories.map(category => (
                <div key={category} className="mb-6">
                  <h2 className="text-lg font-medium mb-3" style={accentStyle}>
                    {category}
                  </h2>
                  <div className="grid gap-3">
                    {displayedCategorizedLinks[category].map(link => (
                      <a 
                        key={link.id} 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block p-4 rounded-lg border transition-colors hover:bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ 
                          borderColor: 'var(--profile-secondary, var(--border))',
                          background: 'rgba(255, 255, 255, 0.1)'
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium" style={{ color: 'var(--profile-contrast-text, var(--foreground))' }}>
                              {link.title}
                            </div>
                            <div className="text-sm truncate max-w-xs" style={{ 
                              color: 'var(--profile-contrast-text, var(--foreground))',
                              opacity: 0.8 
                            }}>
                              {link.url}
                            </div>
                          </div>
                          <ExternalLink 
                            className="w-4 h-4 flex-shrink-0" 
                            style={{ color: 'var(--profile-accent, var(--primary))' }}
                          />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                {searchTerm ? (
                  <p>No links found matching "{searchTerm}"</p>
                ) : (
                  <p>No links have been added yet.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 