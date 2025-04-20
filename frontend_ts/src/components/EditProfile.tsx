import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Edit, Trash2, GripVertical, ArrowLeft, Plus } from 'lucide-react';
import { toast } from './ui/use-toast';
import ThemeSelector, { themes } from './ThemeSelector';

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
  onEdit: (link: Link) => void;
  onDelete: (id: number) => void;
}

const SortableLink = ({ link, onEdit, onDelete }: SortableLinkProps) => {
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
        <div {...listeners} className="cursor-move text-muted-foreground">
          <GripVertical size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{link.title}</h3>
          <div className="text-primary break-all block mb-1">
            {link.url}
          </div>
          {link.category && (
            <span className="text-xs px-2 py-1 rounded-full bg-accent/20 text-accent-foreground">
              {link.category}
            </span>
          )}
        </div>
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
      </CardContent>
    </Card>
  );
};

const EditProfile = () => {
  const { username } = useParams<{ username: string }>();
  const { userId, isSignedIn } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [editingLink, setEditingLink] = useState<EditingLink | null>(null);
  const [error, setError] = useState('');
  const [newLink, setNewLink] = useState<Omit<Link, 'id'>>({ title: '', url: '', category: '' });
  const [selectedTheme, setSelectedTheme] = useState('');
  const navigate = useNavigate();

  const categories = ['Projects', 'Clubs', 'Research', 'Social Media', 'Education', 'Work', 'Personal', 'Other'];

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
      const isOwner = profile.user_id === userId;
      setIsOwner(isOwner);
      
      if (!isOwner) {
        // Redirect to profile view if not the owner
        navigate(`/profile/${username}`);
      }
      
      setSelectedTheme(profile.theme || 'dark');
    }
  }, [profile, userId, navigate, username]);

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
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    }
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLink.title || !newLink.url || !profile) return;

    // Ensure URL has http(s) prefix
    let formattedUrl = newLink.url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    try {
      const updatedLinks = [...(profile.links || []), { ...newLink, url: formattedUrl, id: Date.now() }];
      
      const { error } = await supabase
        .from('profiles')
        .update({ links: updatedLinks })
        .eq('username', username);

      if (error) throw error;

      setProfile({ ...profile, links: updatedLinks });
      setNewLink({ title: '', url: '', category: '' });
      toast({
        title: "Link added",
        description: "Your link has been added successfully",
      });
    } catch (err: any) {
      console.error('Error adding link:', err);
      setError('Failed to add link');
      toast({
        title: "Error",
        description: "Failed to add link",
        variant: "destructive"
      });
    }
  };

  const handleEditLink = (link: Link) => {
    setEditingLink({
      ...link,
      tempTitle: link.title,
      tempUrl: link.url,
      tempCategory: link.category || ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editingLink || !profile) return;
    
    // Ensure URL has http(s) prefix
    let formattedUrl = editingLink.tempUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    try {
      const updatedLinks = profile.links.map(link =>
        link.id === editingLink.id
          ? {
              ...link,
              title: editingLink.tempTitle,
              url: formattedUrl,
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
      setEditingLink(null);
      toast({
        title: "Link updated",
        description: "Your link has been updated successfully",
      });
    } catch (err: any) {
      console.error('Error saving edit:', err);
      setError('Failed to save changes');
      toast({
        title: "Error",
        description: "Failed to update link",
        variant: "destructive"
      });
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
      toast({
        title: "Link deleted",
        description: "Your link has been deleted successfully",
      });
    } catch (err: any) {
      console.error('Error deleting link:', err);
      setError('Failed to delete link');
      toast({
        title: "Error",
        description: "Failed to delete link",
        variant: "destructive"
      });
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
        toast({
          title: "Links reordered",
          description: "Your links have been reordered successfully",
        });
      } catch (err: any) {
        console.error('Error reordering links:', err);
        setError('Failed to reorder links');
        toast({
          title: "Error",
          description: "Failed to reorder links",
          variant: "destructive"
        });
      }
    }
  };

  const handleThemeChange = async (themeId: string) => {
    if (!profile) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ theme: themeId })
        .eq('username', username);

      if (error) throw error;

      setProfile({ ...profile, theme: themeId });
      setSelectedTheme(themeId);
      toast({
        title: "Theme updated",
        description: "Your theme has been updated successfully",
      });
    } catch (err: any) {
      console.error('Error updating theme:', err);
      setError('Failed to update theme');
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive"
      });
    }
  };

  const handleBackToProfile = () => {
    navigate(`/profile/${username}`);
  };

  if (!profile) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (!isOwner) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to edit this profile.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate(`/profile/${username}`)}>
              View Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackToProfile}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Profile
          </Button>
          <h1 className="text-2xl font-bold">Edit LinkHub</h1>
        </div>

        <Card className="border">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Choose a theme for your LinkHub page</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeSelector selectedTheme={selectedTheme} onSelect={handleThemeChange} />
          </CardContent>
        </Card>

        <Card className="border">
          <CardHeader>
            <CardTitle>Your Links</CardTitle>
            <CardDescription>Add, edit, delete or reorder your links</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Add New Link</h3>
              <form onSubmit={handleAddLink} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. My GitHub"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="text"
                    value={newLink.url}
                    onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                    className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g. github.com/username"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newLink.category}
                    onChange={(e) => setNewLink({ ...newLink, category: e.target.value })}
                    className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-3">
                  <Button type="submit" className="flex items-center">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Link
                  </Button>
                </div>
              </form>
            </div>

            {profile.links && profile.links.length > 0 ? (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3">Manage Links</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop to reorder your links.
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={profile.links.map(link => link.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {profile.links.map((link) => (
                      <SortableLink
                        key={link.id}
                        link={link}
                        onEdit={handleEditLink}
                        onDelete={handleDeleteLink}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            ) : (
              <div className="p-6 text-center border rounded-lg">
                <p className="text-muted-foreground">No links added yet. Add your first link above.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingLink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={editingLink.tempTitle}
                    onChange={(e) => setEditingLink({ ...editingLink, tempTitle: e.target.value })}
                    className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">URL</label>
                  <input
                    type="text"
                    value={editingLink.tempUrl}
                    onChange={(e) => setEditingLink({ ...editingLink, tempUrl: e.target.value })}
                    className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={editingLink.tempCategory}
                    onChange={(e) => setEditingLink({ ...editingLink, tempCategory: e.target.value })}
                    className="w-full p-2 rounded-md border focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setEditingLink(null)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EditProfile; 