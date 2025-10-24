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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
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
} from 'phosphor-react-native';
import { router } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { removeFromLibrary, unmarkReviewed } from '@/store/slices/gameSlice';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ConfirmationModal';
import { deleteReviewByGameId } from '@/store/slices/reviewSlice';
import { useAchievements } from '@/hooks/useAchievements';
import { fetchUserReviews, deleteReview } from '@/store/slices/reviewSlice';
import { useAuth } from '@/hooks/useAuth';



// Mock games for search
const mockGamesForSearch = [
  {
    id: '1',
    title: 'Cyberpunk 2077',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'RPG',
  },
  {
    id: '2',
    title: 'Elden Ring',
    coverUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    genre: 'Action RPG',
  },
  {
    id: '3',
    title: 'God of War Ragnarök',
    coverUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    genre: 'Action Adventure',
  },
  {
    id: '4',
    title: 'The Witcher 3',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'RPG',
  },
  {
    id: '5',
    title: "Baldur's Gate 3",
    coverUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    genre: 'RPG',
  },
  {
    id: '6',
    title: 'Spider-Man 2',
    coverUrl:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    genre: 'Action',
  },
  {
    id: '7',
    title: 'Alan Wake 2',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'Horror',
  },
  {
    id: '8',
    title: 'Call of Duty: Modern Warfare III',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'FPS',
  },
  {
    id: '9',
    title: 'Doom Eternal',
    coverUrl:
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    genre: 'FPS',
  },
  {
    id: '10',
    title: 'Final Fantasy VII Rebirth',
    coverUrl:
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'RPG',
  },
];

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
  
  // Initialize empty state - no mock data
  const [customLists, setCustomLists] = useState<any[]>([]);
  const dispatch = useDispatch();
  const { user } = useAuth();
  const libraryGames = useSelector((state: RootState) => state.game.libraryGames);
  const reviewedGameIds = useSelector((state: RootState) => state.game.reviewedGameIds);
  const reviews = useSelector((state: RootState) => state.reviews.reviews as any[]);
  
  // Confirmation modal
  const { confirmationState, showConfirmation, hideConfirmation } = useConfirmation();
  
  // Fetch user reviews when component mounts
  useEffect(() => {
    if (user) {
      dispatch(fetchUserReviews(user.id) as any);
    }
  }, [user, dispatch]);
  
  const [editingList, setEditingList] = useState<any>(null);

  // Game search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedGames, setSelectedGames] = useState<any[]>([]);

  // Reviewed games state (from Redux reviewed ids)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const results = mockGamesForSearch.filter(
          (game) =>
            game.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            game.genre.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
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

    if (editingList) {
      const updatedLists = customLists.map((list) =>
        list.id === editingList.id
          ? {
              ...list,
              name: newListName,
              description: newListDescription,
              games: selectedGames,
            }
          : list
      );
      setCustomLists(updatedLists);
      showConfirmation(
        'Success',
        'List updated successfully!',
        () => {},
        'success',
        'OK',
        ''
      );
    } else {
      const newList = {
        id: Date.now().toString(),
        name: newListName,
        description: newListDescription,
        games: selectedGames,
      };
      setCustomLists([...customLists, newList]);
      
      // Track achievement for creating a new list
      await trackListCreated();
      
      showConfirmation(
        'Success',
        'List created successfully!',
        () => {},
        'success',
        'OK',
        ''
      );
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
        setCustomLists(customLists.filter((list) => list.id !== listId));
        
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
      params: { game: JSON.stringify(game) },
    });
  };

  const handleRemoveFromLibrary = (gameId: string) => {
    showConfirmation(
      'Remove from Library',
      'Are you sure you want to remove this game from your library?',
      async () => {
        dispatch(removeFromLibrary(gameId));
        
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
          await dispatch(deleteReview(review.id) as any);
          dispatch(unmarkReviewed(String(review.game.id)));
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
        existingReview: activity.review
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
          dispatch(deleteReviewByGameId(review.game.id));
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
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-8">
        {/* Delete All Reviews Button */}
        {reviews.length > 0 && (
          <TouchableOpacity
            className="mb-4 p-3 bg-[#FF6B6B]/20 border border-[#FF6B6B]/40 rounded-xl flex-row items-center justify-center"
            onPress={handleDeleteAllReviews}
            activeOpacity={0.7}
          >
            <Trash size={18} color="#FF6B6B" weight="bold" />
            <Text className="ml-2 text-[#FF6B6B] font-semibold">
              Delete All Reviews ({reviews.length})
            </Text>
          </TouchableOpacity>
        )}
        
        {reviews.map((review) => (
          <View key={review.id} className="mb-6 bg-[#232946] rounded-2xl p-4">
            <View className="flex-row items-center mb-2">
              <View className="w-8 h-8 rounded-full bg-[#121629] justify-center items-center mr-3">
                <GameController size={20} color="#94A3B8" weight="bold" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-medium">
                  You reviewed{' '}
                  <Text className="font-bold text-[#00D2FF]">
                    {review.game.name}
                  </Text>
                </Text>
                <Text className="text-xs text-[#94A3B8]">{review.date}</Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity 
                  className="p-2 mr-1 bg-[#374151] rounded-lg"
                  onPress={() => handleEditReview({ id: review.id, game: { id: review.game.id, title: review.game.name, coverUrl: review.game.coverUrl, rating: review.rating }, review: review.reviewText })}
                  activeOpacity={0.7}
                >
                  <PencilSimple size={18} color="#94A3B8" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="p-2 mr-2 bg-[#FF6B6B]/20 rounded-lg"
                  onPress={() => handleDeleteReview(review)}
                  activeOpacity={0.7}
                >
                  <Trash size={18} color="#FF6B6B" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity className="p-1">
                  <Heart
                    size={20}
                    color={'#94A3B8'}
                    weight={'regular'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity 
                onPress={() => router.push(`/game/${review.game.id}`)}
              >
                <Image
                  source={{ uri: review.game.coverUrl }}
                  className="w-16 h-24 rounded-xl mr-3"
                />
              </TouchableOpacity>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Star size={16} color="#FFD700" weight="fill" />
                  <Text className="ml-1 text-[#FFD700] font-semibold">
                    {review.rating}
                  </Text>
                </View>
                <Text className="text-white leading-5">{review.reviewText}</Text>
              </View>
            </View>
          </View>
        ))}
        {reviews.length === 0 && (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 rounded-full bg-[#232946] justify-center items-center mb-4">
              <GameController size={32} color="#94A3B8" weight="bold" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">No Reviews Yet</Text>
            <Text className="text-[#94A3B8] text-center px-8">
              Start reviewing games to see your activity here!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderLibraryTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-8">
        <Text className="text-white font-bold text-lg mb-4">
          Games to Review Later
        </Text>
        {libraryGames.length > 0 ? (
          libraryGames.map((game) => (
            <View
              key={game.id}
              className="flex-row items-center bg-[#232946] rounded-2xl p-4 mb-4"
            >
              <Image
                source={{ uri: game.coverUrl }}
                className="w-16 h-24 rounded-xl mr-3"
              />
              <View className="flex-1">
                <Text className="text-white font-semibold">{game.title}</Text>
                {!!game.genre && <Text className="text-[#94A3B8]">{game.genre}</Text>}
                <Text className="text-xs text-[#94A3B8]">
                  Added {game.addedDate}
                </Text>
              </View>
              <View className="flex-col items-end">
                <TouchableOpacity
                  className={`px-3 py-2 rounded-lg mb-2 ${
                    isGameReviewed(game.id) ? 'bg-[#FFD700]' : 'bg-[#00D2FF]'
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
                  className="p-2 rounded-lg bg-[#232946]"
                  onPress={() => handleRemoveFromLibrary(game.id)}
                >
                  <Trash size={16} color="#FF6B6B" weight="bold" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        ) : (
          <View className="flex-1 justify-center items-center py-20">
            <View className="w-20 h-20 rounded-full bg-[#232946] justify-center items-center mb-4">
              <ListBullets size={32} color="#94A3B8" weight="bold" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">No Games in Library</Text>
            <Text className="text-[#94A3B8] text-center px-8 leading-5">
              Add games to your library to review them later!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderListsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="px-5 pb-8">
        <TouchableOpacity
          className="mb-6"
          onPress={() => setShowCreateListModal(true)}
        >
          <LinearGradient
            colors={['#00D2FF', '#6c5ce7']}
            className="flex-row items-center rounded-2xl px-5 py-4"
          >
            <Plus size={24} color="#FFFFFF" weight="bold" />
            <Text className="ml-3 text-white font-bold text-lg">
              Create New List
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {customLists.length > 0 ? (
          customLists.map((list) => (
            <View key={list.id} className="mb-6 bg-[#232946] rounded-2xl p-4">
              <View className="flex-row items-center mb-2">
                <View className="flex-1">
                  <Text className="text-white font-bold text-lg">
                    {list.name}
                  </Text>
                  <Text className="text-[#94A3B8]">{list.description}</Text>
                  <Text className="text-xs text-[#94A3B8]">
                    {list.games.length} games
                  </Text>
                </View>
                <View className="flex-row">
                  <TouchableOpacity
                    className="p-2 mr-2"
                    onPress={() => handleEditList(list)}
                  >
                    <PencilSimple size={20} color="#94A3B8" weight="bold" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="p-2"
                    onPress={() => handleDeleteList(list.id)}
                  >
                    <Trash size={20} color="#FF6B6B" weight="bold" />
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
            <View className="w-20 h-20 rounded-full bg-[#232946] justify-center items-center mb-4">
              <Plus size={32} color="#94A3B8" weight="bold" />
            </View>
            <Text className="text-white text-xl font-bold mb-2">No Lists Yet</Text>
            <Text className="text-[#94A3B8] text-center px-8 leading-5">
              Create your first custom game list using the button above!
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#0F0F1F', '#121631', '#0A2342']}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4">
          <View className="flex-1">
            <Text className="font-bold text-xl text-white">Activity</Text>
            <Text className="text-xs text-gray-400">
              Reviews: {reviews.length} | Library: {libraryGames.length} | Lists: {customLists.length}
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full justify-center items-center">
            <ListBullets size={24} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row px-5 mb-4">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl mr-2 ${
              activeTab === 'reviews' ? 'bg-[#00D2FF]' : 'bg-[#1A2238]'
            }`}
            onPress={() => setActiveTab('reviews')}
          >
            <Text
              className={`font-semibold text-center ${
                activeTab === 'reviews' ? 'text-white' : 'text-white'
              }`}
            >
              Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl mx-1 ${
              activeTab === 'library' ? 'bg-[#00D2FF]' : 'bg-[#1A2238]'
            }`}
            onPress={() => setActiveTab('library')}
          >
            <Text
              className={`font-semibold text-center ${
                activeTab === 'library' ? 'text-white' : 'text-white'
              }`}
            >
              Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-xl ml-2 ${
              activeTab === 'lists' ? 'bg-[#00D2FF]' : 'bg-[#1A2238]'
            }`}
            onPress={() => setActiveTab('lists')}
          >
            <Text
              className={`font-semibold text-center ${
                activeTab === 'lists' ? 'text-white' : 'text-white'
              }`}
            >
              Lists
            </Text>
          </TouchableOpacity>
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
            <View className="bg-[#1A2238] rounded-t-3xl p-6 max-h-[80%]">
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
                className="bg-[#0F1419] rounded-xl px-4 py-3 mb-4 border border-[#374151] text-white font-normal text-base"
                placeholder="List name (e.g., Action & Adventure)"
                placeholderTextColor="#94A3B8"
                value={newListName}
                onChangeText={setNewListName}
              />

              <TextInput
                className="bg-[#0F1419] rounded-xl px-4 py-3 mb-4 border border-[#374151] text-white font-normal text-base min-h-[80px]"
                placeholder="Description (optional)"
                placeholderTextColor="#94A3B8"
                value={newListDescription}
                onChangeText={setNewListDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              {/* Game Search */}
              <View className="flex-row items-center bg-[#0F1419] rounded-xl px-4 py-3 mb-4 border border-[#374151]">
                <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
                <TextInput
                  className="flex-1 ml-3 text-white font-normal text-base"
                  placeholder="Search games to add..."
                  placeholderTextColor="#94A3B8"
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
                      className="flex-row items-center mb-2 bg-[#232946] rounded-xl p-2"
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
                        <Text className="text-xs text-[#94A3B8]">
                          {game.genre}
                        </Text>
                      </View>
                      <Plus size={20} color="#00D2FF" weight="bold" />
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
                        className="flex-row items-center mb-2 bg-[#232946] rounded-xl p-2"
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
                          <X size={16} color="#FF6B6B" weight="bold" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TouchableOpacity className="mt-2" onPress={handleCreateList}>
                <LinearGradient
                  colors={['#00D2FF', '#6c5ce7']}
                  className="flex-row items-center justify-center rounded-xl px-5 py-3"
                >
                  <Check size={20} color="#FFFFFF" weight="bold" />
                  <Text className="ml-2 text-white font-bold text-base">
                    {editingList ? 'Update List' : 'Create List'}
                  </Text>
                </LinearGradient>
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

