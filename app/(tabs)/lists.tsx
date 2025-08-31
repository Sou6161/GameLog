import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, ListBullets, Star, Heart, Clock, GameController, X, Check, Trash, PencilSimple, MagnifyingGlass } from 'phosphor-react-native';
import { router } from 'expo-router';

// Mock data for activity feed
const mockActivityFeed = [
  {
    id: '1',
    type: 'reviewed',
    game: {
      id: '1',
      title: 'Cyberpunk 2077',
      coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
      rating: 4.5,
    },
    review: 'Amazing open world with incredible storytelling!',
    timestamp: '2m ago',
    liked: true,
  },
  {
    id: '2',
    type: 'played',
    game: {
      id: '2',
      title: 'Elden Ring',
      coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
      rating: 5.0,
    },
    review: 'Masterpiece of a game. FromSoftware at their best!',
    timestamp: '1h ago',
    liked: false,
  },
  {
    id: '3',
    type: 'reviewed',
    game: {
      id: '3',
      title: 'God of War Ragnarök',
      coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
      rating: 4.8,
    },
    review: 'Epic conclusion to Kratos and Atreus journey.',
    timestamp: '3h ago',
    liked: true,
  },
];

// Mock data for library
const mockLibrary = [
  {
    id: '1',
    title: 'Baldur\'s Gate 3',
    coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop',
    genre: 'RPG',
    addedDate: '2024-01-15',
  },
  {
    id: '2',
    title: 'Spider-Man 2',
    coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop',
    genre: 'Action',
    addedDate: '2024-01-10',
  },
  {
    id: '3',
    title: 'Alan Wake 2',
    coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop',
    genre: 'Horror',
    addedDate: '2024-01-05',
  },
];

// Mock data for custom lists
const mockCustomLists = [
  {
    id: '1',
    name: 'Action & Adventure',
    description: 'Epic action games with amazing stories',
    games: [
      { id: '1', title: 'God of War Ragnarök', coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop' },
      { id: '2', title: 'Spider-Man 2', coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop' },
    ],
  },
  {
    id: '2',
    name: 'FPS & High Octane',
    description: 'Fast-paced first-person shooters',
    games: [
      { id: '3', title: 'Call of Duty: Modern Warfare III', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop' },
      { id: '4', title: 'Doom Eternal', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop' },
    ],
  },
  {
    id: '3',
    name: 'Upcoming 2024',
    description: 'Games I want to play this year',
    games: [
      { id: '5', title: 'Final Fantasy VII Rebirth', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop' },
    ],
  },
];

// Mock games for search
const mockGamesForSearch = [
  { id: '1', title: 'Cyberpunk 2077', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop', genre: 'RPG' },
  { id: '2', title: 'Elden Ring', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop', genre: 'Action RPG' },
  { id: '3', title: 'God of War Ragnarök', coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop', genre: 'Action Adventure' },
  { id: '4', title: 'The Witcher 3', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop', genre: 'RPG' },
  { id: '5', title: 'Baldur\'s Gate 3', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop', genre: 'RPG' },
  { id: '6', title: 'Spider-Man 2', coverUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=600&fit=crop', genre: 'Action' },
  { id: '7', title: 'Alan Wake 2', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop', genre: 'Horror' },
  { id: '8', title: 'Call of Duty: Modern Warfare III', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop', genre: 'FPS' },
  { id: '9', title: 'Doom Eternal', coverUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=600&fit=crop', genre: 'FPS' },
  { id: '10', title: 'Final Fantasy VII Rebirth', coverUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop', genre: 'RPG' },
];

export default function ActivityScreen() {
  const [activeTab, setActiveTab] = useState('reviews');
  const [showCreateListModal, setShowCreateListModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [customLists, setCustomLists] = useState(mockCustomLists);
  const [editingList, setEditingList] = useState<any>(null);
  
  // Game search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedGames, setSelectedGames] = useState<any[]>([]);

  // Library and reviewed games state
  const [libraryGames, setLibraryGames] = useState(mockLibrary);
  const [reviewedGames, setReviewedGames] = useState<string[]>(['1', '3']); // IDs of reviewed games

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        const results = mockGamesForSearch.filter(game =>
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

  const handleCreateList = () => {
    if (newListName.trim() === '') {
      Alert.alert('Error', 'Please enter a list name');
      return;
    }

    if (editingList) {
      // Update existing list
      const updatedLists = customLists.map(list => 
        list.id === editingList.id 
          ? { ...list, name: newListName, description: newListDescription, games: selectedGames }
          : list
      );
      setCustomLists(updatedLists);
      Alert.alert('Success', 'List updated successfully!');
    } else {
      // Create new list
      const newList = {
        id: Date.now().toString(),
        name: newListName,
        description: newListDescription,
        games: selectedGames,
      };
      setCustomLists([...customLists, newList]);
      Alert.alert('Success', 'List created successfully!');
    }

    // Reset form
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
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setCustomLists(customLists.filter(list => list.id !== listId));
          },
        },
      ]
    );
  };

  const handleAddGameToList = (game: any) => {
    if (!selectedGames.find(g => g.id === game.id)) {
      setSelectedGames([...selectedGames, game]);
    }
  };

  const handleRemoveGameFromList = (gameId: string) => {
    setSelectedGames(selectedGames.filter(game => game.id !== gameId));
  };

  const handleReviewNow = (game: any) => {
    // Navigate to the log page (review page) with the selected game
    router.push({
      pathname: '/log',
      params: { game: JSON.stringify(game) }
    });
  };

  const handleRemoveFromLibrary = (gameId: string) => {
    Alert.alert(
      'Remove from Library',
      'Are you sure you want to remove this game from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setLibraryGames(libraryGames.filter(game => game.id !== gameId));
            Alert.alert('Success', 'Game removed from library!');
          },
        },
      ]
    );
  };

  const isGameReviewed = (gameId: string) => {
    return reviewedGames.includes(gameId);
  };

  const renderReviewsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        {mockActivityFeed.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={styles.activityHeader}>
              <View style={styles.userAvatar}>
                <GameController size={20} color="#94A3B8" weight="bold" />
              </View>
              <View style={styles.activityInfo}>
                <Text style={styles.activityText}>
                  You {activity.type} <Text style={styles.gameTitle}>{activity.game.title}</Text>
                </Text>
                <Text style={styles.activityTimestamp}>{activity.timestamp}</Text>
              </View>
              <TouchableOpacity style={styles.likeButton}>
                <Heart 
                  size={20} 
                  color={activity.liked ? "#FF6B6B" : "#94A3B8"} 
                  weight={activity.liked ? "fill" : "regular"} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.gameInfo}>
              <Image source={{ uri: activity.game.coverUrl }} style={styles.gameCover} />
              <View style={styles.gameDetails}>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#FFD700" weight="fill" />
                  <Text style={styles.ratingText}>{activity.game.rating}</Text>
                </View>
                <Text style={styles.reviewText}>{activity.review}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderLibraryTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Games to Review Later</Text>
        {libraryGames.map((game) => (
          <View key={game.id} style={styles.libraryItem}>
            <Image source={{ uri: game.coverUrl }} style={styles.libraryGameCover} />
            <View style={styles.libraryGameInfo}>
              <Text style={styles.libraryGameTitle}>{game.title}</Text>
              <Text style={styles.libraryGameGenre}>{game.genre}</Text>
              <Text style={styles.libraryGameDate}>Added {game.addedDate}</Text>
            </View>
            <View style={styles.libraryActions}>
              <TouchableOpacity 
                style={[
                  styles.reviewNowButton,
                  isGameReviewed(game.id) && styles.updateReviewButton
                ]}
                onPress={() => handleReviewNow(game)}
              >
                <Text style={[
                  styles.reviewNowText,
                  isGameReviewed(game.id) && styles.updateReviewText
                ]}>
                  {isGameReviewed(game.id) ? 'Update Review' : 'Review Now'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.removeFromLibraryButton}
                onPress={() => handleRemoveFromLibrary(game.id)}
              >
                <Trash size={16} color="#FF6B6B" weight="bold" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderListsTab = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.tabContent}>
        <TouchableOpacity 
          style={styles.createListButton}
          onPress={() => setShowCreateListModal(true)}
        >
          <LinearGradient
            colors={['#00D2FF', '#6c5ce7']}
            style={styles.createListGradient}
          >
            <Plus size={24} color="#FFFFFF" weight="bold" />
            <Text style={styles.createListText}>Create New List</Text>
          </LinearGradient>
        </TouchableOpacity>

        {customLists.map((list) => (
          <View key={list.id} style={styles.listItem}>
            <View style={styles.listHeader}>
              <View style={styles.listInfo}>
                <Text style={styles.listName}>{list.name}</Text>
                <Text style={styles.listDescription}>{list.description}</Text>
                <Text style={styles.listCount}>{list.games.length} games</Text>
              </View>
              <View style={styles.listActions}>
                <TouchableOpacity 
                  style={styles.listActionButton}
                  onPress={() => handleEditList(list)}
                >
                  <PencilSimple size={20} color="#94A3B8" weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.listActionButton}
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
                style={styles.listGames}
              >
                {list.games.map((game) => (
                  <View key={game.id} style={styles.listGameItem}>
                    <Image source={{ uri: game.coverUrl }} style={styles.listGameCover} />
                    <Text style={styles.listGameTitle}>{game.title}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={['#6c5ce7','black','#6c5ce7']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Activity</Text>
          <TouchableOpacity style={styles.menuButton}>
            <ListBullets size={24} color="#FFFFFF" weight="bold" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reviews' && styles.activeTab]}
            onPress={() => setActiveTab('reviews')}
          >
            <Text style={[styles.tabText, activeTab === 'reviews' && styles.activeTabText]}>
              Reviews
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'library' && styles.activeTab]}
            onPress={() => setActiveTab('library')}
          >
            <Text style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}>
              Library
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'lists' && styles.activeTab]}
            onPress={() => setActiveTab('lists')}
          >
            <Text style={[styles.tabText, activeTab === 'lists' && styles.activeTabText]}>
              Lists
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContentContainer}>
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
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingList ? 'Edit List' : 'Create New List'}
                </Text>
                <TouchableOpacity onPress={() => {
                  setShowCreateListModal(false);
                  setEditingList(null);
                  setNewListName('');
                  setNewListDescription('');
                  setSelectedGames([]);
                  setSearchQuery('');
                  setSearchResults([]);
                }}>
                  <X size={24} color="#FFFFFF" weight="bold" />
                </TouchableOpacity>
              </View>
              
              <TextInput
                style={styles.modalInput}
                placeholder="List name (e.g., Action & Adventure)"
                placeholderTextColor="#94A3B8"
                value={newListName}
                onChangeText={setNewListName}
              />
              
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Description (optional)"
                placeholderTextColor="#94A3B8"
                value={newListDescription}
                onChangeText={setNewListDescription}
                multiline
                numberOfLines={3}
              />

              {/* Game Search */}
              <View style={styles.searchContainer}>
                <MagnifyingGlass size={20} color="#94A3B8" weight="bold" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search games to add..."
                  placeholderTextColor="#94A3B8"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
                  {searchResults.map((game) => (
                    <TouchableOpacity
                      key={game.id}
                      style={styles.searchResultItem}
                      onPress={() => handleAddGameToList(game)}
                    >
                      <Image source={{ uri: game.coverUrl }} style={styles.searchResultCover} />
                      <View style={styles.searchResultInfo}>
                        <Text style={styles.searchResultTitle}>{game.title}</Text>
                        <Text style={styles.searchResultGenre}>{game.genre}</Text>
                      </View>
                      <Plus size={20} color="#00D2FF" weight="bold" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {/* Selected Games */}
              {selectedGames.length > 0 && (
                <View style={styles.selectedGamesContainer}>
                  <Text style={styles.selectedGamesTitle}>Selected Games ({selectedGames.length})</Text>
                  <ScrollView style={styles.selectedGamesList} showsVerticalScrollIndicator={false}>
                    {selectedGames.map((game) => (
                      <View key={game.id} style={styles.selectedGameItem}>
                        <Image source={{ uri: game.coverUrl }} style={styles.selectedGameCover} />
                        <Text style={styles.selectedGameTitle}>{game.title}</Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveGameFromList(game.id)}
                          style={styles.removeGameButton}
                        >
                          <X size={16} color="#FF6B6B" weight="bold" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              <TouchableOpacity style={styles.modalButton} onPress={handleCreateList}>
              <LinearGradient
                  colors={['#00D2FF', '#6c5ce7']}
                  style={styles.modalButtonGradient}
                >
                  <Check size={20} color="#FFFFFF" weight="bold" />
                  <Text style={styles.modalButtonText}>
                    {editingList ? 'Update List' : 'Create List'}
                  </Text>
              </LinearGradient>
            </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  menuButton: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#00D2FF',
  },
  tabText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: '#94A3B8',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontFamily: 'Inter_600SemiBold',
  },
  tabContentContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  // Activity Tab Styles
  activityItem: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityInfo: {
    flex: 1,
  },
  activityText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
  },
  gameTitle: {
    fontFamily: 'Inter_600SemiBold',
    color: '#FFFFFF',
  },
  activityTimestamp: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  likeButton: {
    padding: 8,
  },
  gameInfo: {
    flexDirection: 'row',
  },
  gameCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  gameDetails: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFD700',
    marginLeft: 4,
  },
  reviewText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  // Library Tab Styles
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  libraryItem: {
    flexDirection: 'row',
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
  },
  libraryGameCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  libraryGameInfo: {
    flex: 1,
  },
  libraryGameTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  libraryGameGenre: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  libraryGameDate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  libraryActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewNowButton: {
    backgroundColor: '#00D2FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  updateReviewButton: {
    backgroundColor: '#FFD700',
  },
  reviewNowText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#000000',
  },
  updateReviewText: {
    color: '#000000',
  },
  removeFromLibraryButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 8,
  },
  // Lists Tab Styles
  createListButton: {
    marginBottom: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  createListGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  createListText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
  listItem: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listDescription: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  listCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#64748B',
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
  },
  listActionButton: {
    padding: 8,
  },
  listGames: {
    marginTop: 8,
  },
  listGameItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  listGameCover: {
    width: 60,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  listGameTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#E2E8F0',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A2238',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#374151',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  modalInput: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  searchResults: {
    maxHeight: 150,
    marginBottom: 16,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  searchResultCover: {
    width: 40,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  searchResultGenre: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: '#94A3B8',
  },
  selectedGamesContainer: {
    marginBottom: 16,
  },
  selectedGamesTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  selectedGamesList: {
    maxHeight: 120,
  },
  selectedGameItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  selectedGameCover: {
    width: 40,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  selectedGameTitle: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#FFFFFF',
  },
  removeGameButton: {
    padding: 4,
  },
  modalButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalButtonText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
  },
});