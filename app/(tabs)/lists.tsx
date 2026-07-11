import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { colors, gradients, glow, alpha } from '@/constants/theme';
import { formatReviewDate } from '@/lib/format';
import {
  Plus,
  ListBullets,
  Star,
  Heart,
  Clock,
  GameController,
  X,
  Check,
  Trash,
  PencilSimple,
  MagnifyingGlass,
  CaretRight,
} from 'phosphor-react-native';
import { router } from 'expo-router';
import { useGameStore } from '@/store/gameStore';
import { useListStore } from '@/store/listStore';
import { igdbService } from '@/services/igdbService';
import { useReviewStore } from '@/store/reviewStore';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';
import { useAchievements } from '@/hooks/useAchievements';
import { useAuth } from '@/hooks/useAuth';



export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState('reviews');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  
  // Achievement tracking
  const {
    trackListCreated,
    trackListDeleted,
    trackGameAdded,
    trackGameRemoved,
    trackReviewDeleted,
  } = useAchievements();
  
  // Lists are persisted on the server (they used to be component state and were
  // lost on every reload).
  const customLists = useListStore((s) => s.lists);
  const fetchLists = useListStore((s) => s.fetchLists);
  const createListOnServer = useListStore((s) => s.createList);
  const updateListOnServer = useListStore((s) => s.updateList);
  const deleteListOnServer = useListStore((s) => s.deleteList);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();
  const allLibraryGames = useGameStore((s) => s.libraryGames);
  // Steam-imported games are kept separate — they live in their own screen
  // (/steam/library), so this library only shows what the user added manually.
  const libraryGames = React.useMemo(
    () => allLibraryGames.filter((g) => g.source !== 'steam'),
    [allLibraryGames]
  );
  const steamGameCount = React.useMemo(
    () => allLibraryGames.filter((g) => g.source === 'steam').length,
    [allLibraryGames]
  );
  const reviewedGameIds = useGameStore((s) => s.reviewedGameIds);
  const reviews = useReviewStore((s) => s.reviews) as any[];
  const removeFromLibrary = useGameStore((s) => s.removeFromLibrary);
  const unmarkReviewed = useGameStore((s) => s.unmarkReviewed);
  const fetchUserReviews = useReviewStore((s) => s.fetchUserReviews);
  const deleteReview = useReviewStore((s) => s.deleteReview);
  const deleteReviewByGameId = useReviewStore((s) => s.deleteReviewByGameId);
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
  
  // Fetch user reviews + lists when component mounts
  useEffect(() => {
    if (user) {
      fetchUserReviews(user.id);
      fetchLists();
    }
  }, [user]);
  
  const [editingList, setEditingList] = useState<any>(null);

  // Game search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedGames, setSelectedGames] = useState<any[]>([]);

  // Reviewed games state (from Redux reviewed ids)

  // Debounced REAL game search (IGDB) — this used to filter a hardcoded array.
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const games = await igdbService.searchGames(q);
        if (cancelled) return;
        setSearchResults(
          games.map((g: any) => ({
            id: String(g.id),
            title: g.name,
            coverUrl: g.cover?.url ? g.cover.url.replace('t_thumb', 't_cover_small') : '',
            genre: g.genres?.[0]?.name || '',
          }))
        );
      } catch (error) {
        if (!cancelled) {
          console.error('Game search failed:', error);
          setSearchResults([]);
        }
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleCreateList = async () => {
    if (newListName.trim() === '') {
      showConfirmation(
        'Error',
        'Please enter a list name',
        () => {},
        'warning',
        'OK',
        ''
      );
      return;
    }

    try {
      if (editingList) {
        await updateListOnServer(editingList.id, {
          name: newListName,
          description: newListDescription,
          games: selectedGames,
        });
        showConfirmation('Success', 'List updated successfully!', () => {}, 'success', 'OK', '');
      } else {
        // The server creates the list and awards its XP (keyed by the list id,
        // so re-saving can never farm more).
        await createListOnServer({
          name: newListName,
          description: newListDescription,
          games: selectedGames,
        });
        await trackListCreated();
        showConfirmation('Success', 'List created successfully!', () => {}, 'success', 'OK', '');
      }
    } catch (error) {
      console.error('Failed to save list:', error);
      showConfirmation(
        'Error',
        'Could not save your list. Please check your connection and try again.',
        () => {},
        'warning',
        'OK',
        ''
      );
      return;
    }

    setNewListName('');
    setNewListDescription('');
    setSelectedGames([]);
    setSearchQuery('');
    setSearchResults([]);
    setEditingList(null);
    setShowCreateListModal(false);
  };

  const handleEditList = (list: any) => {
    setEditingList(list);
    setNewListName(list.name);
    setNewListDescription(list.description);
    setSelectedGames([...list.games]);
    setShowCreateListModal(true);
  };

  const handleDeleteList = (listId: string) => {
    showConfirmation(
      'Delete List',
      'Are you sure you want to delete this list?',
      async () => {
        try {
          await deleteListOnServer(listId);
        } catch {
          showConfirmation(
            'Error',
            'Could not delete this list. Please try again.',
            () => {},
            'warning',
            'OK',
            ''
          );
          return;
        }
        // Track achievement for deleting a list
        await trackListDeleted();
      },
      'danger',
      'Delete',
      'Cancel'
    );
  };

  const handleAddGameToList = (game: any) => {
    if (!selectedGames.find((g) => g.id === game.id)) {
      setSelectedGames([...selectedGames, game]);
    }
  };

  const handleRemoveGameFromList = (gameId: string) => {
    setSelectedGames(selectedGames.filter((game) => game.id !== gameId));
  };

  const handleReviewNow = (game: any) => {
    router.push({
      pathname: '/log',
      params: { game: JSON.stringify(game), ts: Date.now().toString() },
    });
  };

  const handleRemoveFromLibrary = (gameId: string) => {
    showConfirmation(
      'Remove from Library',
      'Are you sure you want to remove this game from your library?',
      async () => {
        try {
          await removeFromLibrary(gameId);
        } catch {
          showConfirmation(
            'Error',
            'Could not remove this game. Please try again.',
            () => {},
            'warning',
            'OK',
            ''
          );
          return;
        }

        // Track achievement for removing a game
        await trackGameRemoved();

        showConfirmation(
          'Success',
          'Game removed from library!',
          () => {},
          'success',
          'OK',
          ''
        );
      },
      'warning',
      'Remove',
      'Cancel'
    );
  };

  const isGameReviewed = (gameId: string) => reviewedGameIds.includes(gameId);

  const handleDeleteReview = (review: any) => {
    showConfirmation(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      async () => {
        try {
          await deleteReview(review.id);
          unmarkReviewed(String(review.game.id));
          if (review && review.rating) {
            await trackReviewDeleted(review.rating);
          }
          showConfirmation(
            'Success',
            'Review deleted successfully!',
            () => {},
            'success',
            'OK',
            ''
          );
        } catch (error) {
          console.error('Error deleting review:', error);
          showConfirmation(
            'Error',
            'Failed to delete review. Please try again.',
            () => {},
            'warning',
            'OK',
            ''
          );
        }
      },
      'danger',
      'Delete',
      'Cancel'
    );
  };

  const handleEditReview = (activity: any) => {
    // Navigate to log screen with pre-filled data for editing
    router.push({
      pathname: '/log',
      params: {
        game: JSON.stringify(activity.game),
        editMode: 'true',
        reviewId: activity.id,
        existingReview: activity.review,
        ts: Date.now().toString(),
      },
    });
  };

  const handleDeleteAllReviews = () => {
    if (reviews.length === 0) {
      showConfirmation(
        'No Reviews',
        'There are no reviews to delete.',
        () => {},
        'info',
        'OK',
        ''
      );
      return;
    }
    
    showConfirmation(
      'Delete All Reviews',
      `Are you sure you want to delete all ${reviews.length} reviews? This action cannot be undone.`,
      async () => {
        console.log('Deleting all reviews');
        
        // Track all deletions
        for (const review of reviews) {
          if (review.game && review.game.rating) {
            await trackReviewDeleted(review.game.rating);
          }
        }
        
        // Delete all reviews from Redux
        reviews.forEach(review => {
          deleteReviewByGameId(review.game.id);
        });
        
        showConfirmation(
          'Success',
          'All reviews deleted successfully!',
          () => {},
          'success',
          'OK',
          ''
        );
      },
      'danger',
      'Delete All',
      'Cancel'
    );
  };

  const renderReviewsTab = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 120 : 100 }}
    >
      <View className="px-5 pb-8">
        {/* Delete All Reviews Button */}
        {reviews.length > 0 && (
          <TouchableOpacity
            className="mb-4 p-3 bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-xl flex-row items-center justify-center"
            onPress={handleDeleteAllReviews}
            activeOpacity={0.7}
          >
            <Trash size={18} color="#EF4444" weight="bold" />
            <Text className="ml-2 text-[#EF4444] font-semibold">
              Delete All Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        )}
        
        {reviews.map((review) => (
          <View key={review.id} className="mb-6 bg-[#12171E] rounded-2xl p-4 border border-[#232C37]">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-[#232C37] justify-center items-center mr-3">
                <GameController size={20} color="#AEB9C4" weight="bold" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">
                  You reviewed{' '}
                  <Text className="font-bold text-[#14C8B0]">
                    {review.game.name}
                  </Text>
                </Text>
                <Text className="text-xs text-[#AEB9C4]">{formatReviewDate(review.date)}</Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity 
                  className="p-2 mr-1 bg-[#232C37] rounded-lg"
                  onPress={() => handleEditReview({ id: review.id, game: { id: review.game.id, title: review.game.name, coverUrl: review.game.coverUrl, rating: review.rating }, review: review.reviewText })}
                  activeOpacity={0.7}
                >
                  <PencilSimple size={18} color="#AEB9C4" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="p-2 mr-2 bg-[#EF4444]/20 rounded-lg"
                  onPress={() => handleDeleteReview(review)}
                  activeOpacity={0.7}
                >
                  <Trash size={18} color="#EF4444" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1">
                  <Heart
                    size={20}
                    color={'#AEB9C4'}
                    weight={'regular'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row">
              <TouchableOpacity onPress={() => router.push(`/game/${review.game.id}`)}>
                {review.game.coverUrl ? (
                  <Image source={{ uri: review.game.coverUrl }} className="w-16 h-24 rounded-xl mr-3" />
                ) : (
                  <View className="w-16 h-24 rounded-xl mr-3 items-center justify-center" style={{ backgroundColor: '#232C37' }}>
                    <GameController size={24} color="#6E7B88" />
                  </View>
                )}
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-white font-bold text-base mb-1" numberOfLines={1}>{review.game.name}</Text>
                <View className="flex-row items-center mb-1.5">
                  <Star size={16} color="#FBBF24" weight="fill" />
                  <Text className="ml-1 text-[#FBBF24] font-semibold">{review.rating}/10</Text>
                </View>
                {!!review.reviewText && <Text className="text-[#AEB9C4] leading-5" numberOfLines={3}>{review.reviewText}</Text>}
                {(review.platform || review.playTime) && (
                  <Text className="text-xs mt-1.5" style={{ color: '#6E7B88' }}>
                    {review.platform ? `${review.platform}` : ''}{review.platform && review.playTime ? ' · ' : ''}{review.playTime ? `${review.playTime}h` : ''}
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
        {reviews.length === 0 && (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 rounded-full bg-[#12171E] justify-center items-center mb-4 border border-[#232C37]">
              <GameController size={32} color="#AEB9C4" weight="bold" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">No Reviews Yet</Text>
            <Text className="text-[#AEB9C4] text-center px-8">
              Start reviewing games to see your activity here!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderLibraryTab = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 120 : 100 }}
    >
      <View className="px-5 pb-8">
        {/* Steam games are a separate library — link across to them. */}
        {steamGameCount > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/steam/library' as any)}
            className="flex-row items-center rounded-2xl p-4 mb-5"
            style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: alpha(colors.blue, 0.5) }}
          >
            <View className="w-11 h-11 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: alpha(colors.blue, 0.18) }}>
              <GameController size={21} color={colors.blue} weight="fill" />
            </View>
            <View className="flex-1">
              <Text className="font-bold text-base" style={{ color: colors.text }}>Steam Library</Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                {steamGameCount} games imported from Steam
              </Text>
            </View>
            <CaretRight size={18} color={colors.textMuted} weight="bold" />
          </TouchableOpacity>
        )}

        <Text className="text-white font-bold text-lg mb-4">
          Games to Review Later
        </Text>
        {libraryGames.length > 0 ? (
          libraryGames.map((game) => (
            <View
              key={game.id}
              className="flex-row items-center bg-[#12171E] rounded-2xl p-4 mb-4 border border-[#232C37]"
            >
              <Image
                source={{ uri: game.coverUrl }}
                className="w-16 h-24 rounded-xl mr-3"
              />
              <View className="flex-1">
                <Text className="text-white font-semibold">{game.title}</Text>
                {!!game.genre && <Text className="text-[#AEB9C4]">{game.genre}</Text>}

                {!!game.addedDate && (
                  <Text className="text-xs text-[#AEB9C4] mt-1">
                    Added {formatReviewDate(game.addedDate)}
                  </Text>
                )}
              </View>
              <View className="flex-col items-end">
                <TouchableOpacity
                  className={`px-3 py-2 rounded-lg mb-2 ${
                    isGameReviewed(game.id) ? 'bg-[#FBBF24]' : 'bg-[#14C8B0]'
                  }`}
                  onPress={() => handleReviewNow(game)}
                >
                  <Text
                    className={`font-bold ${
                      isGameReviewed(game.id) ? 'text-black' : 'text-white'
                    }`}
                  >
                    {isGameReviewed(game.id) ? 'Update Review' : 'Review Now'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="p-2 rounded-lg bg-[#12171E] border border-[#232C37]"
                  onPress={() => handleRemoveFromLibrary(game.id)}
                >
                  <Trash size={16} color="#EF4444" weight="bold" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 rounded-full bg-[#12171E] justify-center items-center mb-4 border border-[#232C37]">
              <ListBullets size={32} color="#AEB9C4" weight="bold" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">No Games in Library</Text>
            <Text className="text-[#AEB9C4] text-center px-8 leading-5">
              Add games to your library to review them later!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderListsTab = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 120 : 100 }}
    >
      <View className="px-5 pb-8">
        <TouchableOpacity
          className="mb-6 flex-row items-center rounded-2xl px-5 py-4"
          style={{ backgroundColor: colors.teal, ...glow(colors.teal, 0.35, 12) }}
          activeOpacity={0.9}
          onPress={() => setShowCreateListModal(true)}
        >
          <Plus size={24} color={colors.void} weight="bold" />
          <Text className="ml-3 font-bold text-lg" style={{ color: colors.void }}>
            Create New List
          </Text>
        </TouchableOpacity>

        {customLists.length > 0 ? (
          customLists.map((list) => (
            <View key={list.id} className="mb-6 bg-[#12171E] rounded-2xl p-4 border border-[#232C37]">
              <View className="flex-row items-center mb-2">
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    {list.name}
                  </Text>
                  <Text className="text-[#AEB9C4]">{list.description}</Text>
                  <Text className="text-xs text-[#AEB9C4]">
                    {list.games.length} games
                  </Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    className="p-2 mr-2"
                    onPress={() => handleEditList(list)}
                  >
                    <PencilSimple size={20} color="#AEB9C4" weight="bold" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeleteList(list.id)}
                  >
                    <Trash size={20} color="#EF4444" weight="bold" />
                  </TouchableOpacity>
                </View>
              </View>
              {list.games.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="flex-row mt-2"
                >
                  {list.games.map((game: any) => (
                    <View key={game.id} className="mr-3 items-center">
                      <Image
                        source={{ uri: game.coverUrl }}
                        className="w-14 h-20 rounded-lg mb-1"
                      />
                      <Text className="text-white text-xs">{game.title}</Text>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 rounded-full bg-[#12171E] justify-center items-center mb-4 border border-[#232C37]">
              <Plus size={32} color="#AEB9C4" weight="bold" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">No Lists Yet</Text>
            <Text className="text-[#AEB9C4] text-center px-8 leading-5">
              Create your first custom game list using the button above!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const TABS: { id: 'reviews' | 'library' | 'lists'; label: string }[] = [
    { id: 'reviews', label: 'Reviews' },
    { id: 'library', label: 'Library' },
    { id: 'lists', label: 'Lists' },
  ];

  return (
    <LinearGradient colors={gradients.screen} className="flex-1" start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
      <StatusBar style="light" />
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-3 pb-4">
          <View className="flex-row items-center gap-3">
            <View style={{ width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.teal, ...glow(colors.teal, 0.5, 12) }}>
              <ListBullets size={22} color={colors.void} weight="fill" />
            </View>
            <View>
              <Text className="font-bold text-[24px]" style={{ color: colors.text }}>Activity</Text>
              <Text className="text-xs" style={{ color: colors.textMuted }}>
                {reviews.length} reviews · {libraryGames.length} library · {customLists.length} lists
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row px-5 mb-4 gap-2.5">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity key={tab.id} className="flex-1 rounded-2xl overflow-hidden" activeOpacity={0.85} onPress={() => setActiveTab(tab.id)}>
                {active ? (
                  <View className="py-3" style={{ backgroundColor: colors.teal, ...glow(colors.teal, 0.4, 10) }}>
                    <Text className="font-bold text-center" style={{ color: colors.void }}>{tab.label}</Text>
                  </View>
                ) : (
                  <View className="py-3" style={{ backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
                    <Text className="font-semibold text-center" style={{ color: colors.textDim }}>{tab.label}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab Content */}
        <View className="flex-1">
          {activeTab === 'reviews' && renderReviewsTab()}
          {activeTab === 'library' && renderLibraryTab()}
          {activeTab === 'lists' && renderListsTab()}
        </View>

        {/* Create/Edit List Modal */}
        <Modal
          visible={showCreateListModal}
          transparent={true}
          animationType="slide"
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-[#12171E] rounded-t-3xl p-6 max-h-[80%] border-t border-[#232C37]">
              <View className="flex-row items-center justify-between mb-6">
                <Text className="font-bold text-xl text-white">
                  {editingList ? 'Edit List' : 'Create New List'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowCreateListModal(false);
                    setEditingList(null);
                    setNewListName('');
                    setNewListDescription('');
                    setSelectedGames([]);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                >
                  <X size={24} color="#FFFFFF" weight="bold" />
                </TouchableOpacity>
              </View>

              <TextInput
                className="bg-[#0A0E13] rounded-xl px-4 py-3 mb-4 border border-[#232C37] text-white font-normal text-base"
                placeholder="List name (e.g., Action & Adventure)"
                placeholderTextColor="#AEB9C4"
                value={newListName}
                onChangeText={setNewListName}
              />

              <TextInput
                className="bg-[#0A0E13] rounded-xl px-4 py-3 mb-4 border border-[#232C37] text-white font-normal text-base min-h-[80px]"
                placeholder="Description (optional)"
                placeholderTextColor="#AEB9C4"
                value={newListDescription}
                onChangeText={setNewListDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Game Search */}
              <View className="flex-row items-center bg-[#0A0E13] rounded-xl px-4 py-3 mb-4 border border-[#232C37]">
                <MagnifyingGlass size={20} color="#AEB9C4" weight="bold" />
                <TextInput
                  className="flex-1 ml-3 text-white font-normal text-base"
                  placeholder="Search games to add..."
                  placeholderTextColor="#AEB9C4"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <ScrollView
                  className="max-h-32 mb-4"
                  showsVerticalScrollIndicator={false}
                >
                  {searchResults.map((game) => (
                    <TouchableOpacity
                      key={game.id}
                      className="flex-row items-center mb-2 bg-[#12171E] rounded-xl p-2 border border-[#232C37]"
                      onPress={() => handleAddGameToList(game)}
                    >
                      <Image
                        source={{ uri: game.coverUrl }}
                        className="w-10 h-14 rounded-lg mr-3"
                      />
                      <View className="flex-1">
                        <Text className="text-white font-semibold">
                          {game.title}
                        </Text>
                        <Text className="text-xs text-[#AEB9C4]">
                          {game.genre}
                        </Text>
                      </View>
                      <Plus size={20} color="#14C8B0" weight="bold" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Selected Games */}
              {selectedGames.length > 0 && (
                <View className="mb-4">
                  <Text className="text-white font-bold mb-2">
                    Selected Games ({selectedGames.length})
                  </Text>
                  <ScrollView
                    className="max-h-24"
                    showsVerticalScrollIndicator={false}
                  >
                    {selectedGames.map((game) => (
                      <View
                        key={game.id}
                        className="flex-row items-center mb-2 bg-[#12171E] rounded-xl p-2 border border-[#232C37]"
                      >
                        <Image
                          source={{ uri: game.coverUrl }}
                          className="w-10 h-14 rounded-lg mr-3"
                        />
                        <Text className="flex-1 text-white">{game.title}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveGameFromList(game.id)}
                          className="p-2"
                        >
                          <X size={16} color="#EF4444" weight="bold" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity
                className="mt-2 flex-row items-center justify-center rounded-xl px-5 py-3.5"
                style={{ backgroundColor: colors.teal, ...glow(colors.teal, 0.3, 10) }}
                activeOpacity={0.9}
                onPress={handleCreateList}
              >
                <Check size={20} color={colors.void} weight="bold" />
                <Text className="ml-2 font-bold text-base" style={{ color: colors.void }}>
                  {editingList ? 'Update List' : 'Create List'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        visible={confirmationState.visible}
        onClose={hideConfirmation}
        onConfirm={confirmationState.onConfirm}
        title={confirmationState.title}
        message={confirmationState.message}
        type={confirmationState.type}
        confirmText={confirmationState.confirmText}
        cancelText={confirmationState.cancelText}
      />
    </LinearGradient>
  );
}

