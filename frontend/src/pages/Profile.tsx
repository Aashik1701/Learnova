import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, Download, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    bio: '',
    preferred_language: 'en',
    proficiency_level: 'beginner',
    theme_preference: 'light',
    accessibility_settings: {},
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          email: user.email || '',
          bio: data.bio || '',
          preferred_language: data.preferred_language || 'en',
          proficiency_level: data.proficiency_level || 'beginner',
          theme_preference: data.theme_preference || 'light',
          accessibility_settings: data.accessibility_settings || {},
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: t('error'),
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          bio: profile.bio,
          preferred_language: profile.preferred_language,
          proficiency_level: profile.proficiency_level,
          theme_preference: profile.theme_preference,
          accessibility_settings: profile.accessibility_settings,
        })
        .eq('id', user.id);

      if (error) throw error;

      // Apply theme
      document.documentElement.classList.toggle('dark', profile.theme_preference === 'dark');

      toast({
        title: t('success'),
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: t('error'),
        description: 'Failed to save profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const exportObj = {
        profile,
        progress: progressData,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportObj, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnova-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: t('success'),
        description: 'Data exported successfully',
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: t('error'),
        description: 'Failed to export data',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">{t('Your Profile')}</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Accordion type="single" collapsible defaultValue="personal" className="space-y-4">
            <AccordionItem value="personal">
              <AccordionTrigger className="text-lg font-semibold">
                {t('Personal Information')}
              </AccordionTrigger>
              <AccordionContent>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">{t('Full Name')}</Label>
                      <Input
                        id="full_name"
                        value={profile.full_name}
                        onChange={(e) =>
                          setProfile({ ...profile, full_name: e.target.value })
                        }
                        placeholder={t('Enter your name')}
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">{t('Email')}</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">{t('Bio')}</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile({ ...profile, bio: e.target.value })
                        }
                        placeholder={t('Tell us about yourself')}
                        rows={4}
                      />
                    </div>
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="learning">
              <AccordionTrigger className="text-lg font-semibold">
                {t('Learning Preferences')}
              </AccordionTrigger>
              <AccordionContent>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="preferred_language">{t('Preferred Language')}</Label>
                      <select
                        id="preferred_language"
                        value={profile.preferred_language}
                        onChange={(e) =>
                          setProfile({ ...profile, preferred_language: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="proficiency_level">{t('Proficiency Level')}</Label>
                      <select
                        id="proficiency_level"
                        value={profile.proficiency_level}
                        onChange={(e) =>
                          setProfile({ ...profile, proficiency_level: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="beginner">{t('Beginner')}</option>
                        <option value="intermediate">{t('Intermediate')}</option>
                        <option value="advanced">{t('Advanced')}</option>
                      </select>
                    </div>
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="appearance">
              <AccordionTrigger className="text-lg font-semibold">
                {t('Appearance & Accessibility')}
              </AccordionTrigger>
              <AccordionContent>
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('Dark Mode')}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t('Toggle between light and dark theme')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {profile.theme_preference === 'light' ? (
                          <Sun className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={profile.theme_preference === 'dark'}
                          onCheckedChange={(checked) =>
                            setProfile({
                              ...profile,
                              theme_preference: checked ? 'dark' : 'light',
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex gap-4">
            <Button onClick={saveProfile} disabled={saving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('Saving...') : t('Save Changes')}
            </Button>
            <Button onClick={exportData} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t('Export Data')}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Profile;
