// Community Reviews Service
// This service manages community reviews from other users

export interface CommunityReview {
  id: string;
  gameId: string;
  gameName?: string; // Add game name for display
  userId: string;
  username: string;
  userAvatar?: string;
  rating: number;
  reviewText: string;
  playTime?: string;
  difficulty?: string;
  platform?: string;
  tags?: string[];
  isPublic: boolean;
  date: string;
  helpful: number;
  verified: boolean; // If the user has verified purchase/play
}

export interface CommunityUser {
  id: string;
  username: string;
  avatar?: string;
  level: number;
  reviewsCount: number;
  verified: boolean;
}

// Mock community users
const mockUsers: CommunityUser[] = [
  {
    id: 'user1',
    username: 'GameMaster99',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    level: 15,
    reviewsCount: 127,
    verified: true,
  },
  {
    id: 'user2',
    username: 'RetroGamer',
    avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    level: 8,
    reviewsCount: 43,
    verified: false,
  },
  {
    id: 'user3',
    username: 'ProGamer_X',
    avatar: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    level: 22,
    reviewsCount: 89,
    verified: true,
  },
  {
    id: 'user4',
    username: 'IndieLover',
    avatar: 'https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    level: 12,
    reviewsCount: 156,
    verified: true,
  },
  {
    id: 'user5',
    username: 'CasualPlayer',
    avatar: 'https://images.pexels.com/photos/1040884/pexels-photo-1040884.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    level: 5,
    reviewsCount: 23,
    verified: false,
  },
];

// Mock community reviews
const mockCommunityReviews: CommunityReview[] = [
  {
    id: 'review1',
    gameId: '1942',
    gameName: 'The Witcher 3: Wild Hunt',
    userId: 'user1',
    username: 'GameMaster99',
    userAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 5,
    reviewText: 'Absolutely incredible game! The graphics are stunning and the gameplay is addictive. I\'ve spent over 100 hours on this and still discovering new things. Highly recommended for any RPG fan!',
    playTime: '120',
    difficulty: 'Hard',
    platform: 'PC',
    tags: ['RPG', 'Fantasy', 'Open World'],
    isPublic: true,
    date: '2024-11-28',
    helpful: 24,
    verified: true,
  },
  {
    id: 'review2',
    gameId: '1942',
    gameName: 'The Witcher 3: Wild Hunt',
    userId: 'user2',
    username: 'RetroGamer',
    userAvatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'Great game with solid mechanics. The story is engaging and the characters are well-developed. Some minor bugs but nothing game-breaking. Worth the price!',
    playTime: '45',
    difficulty: 'Medium',
    platform: 'PlayStation 5',
    tags: ['Action', 'Adventure'],
    isPublic: true,
    date: '2024-11-25',
    helpful: 18,
    verified: false,
  },
  {
    id: 'review3',
    gameId: '1942',
    gameName: 'The Witcher 3: Wild Hunt',
    userId: 'user3',
    username: 'ProGamer_X',
    userAvatar: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 3,
    reviewText: 'Decent game but has some issues. The combat system feels clunky and the UI could be better. Not bad for the price point but there are better alternatives.',
    playTime: '25',
    difficulty: 'Easy',
    platform: 'Xbox Series X',
    tags: ['Strategy', 'Multiplayer'],
    isPublic: true,
    date: '2024-11-22',
    helpful: 8,
    verified: true,
  },
  {
    id: 'review4',
    gameId: '1942',
    gameName: 'The Witcher 3: Wild Hunt',
    userId: 'user4',
    username: 'IndieLover',
    userAvatar: 'https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 5,
    reviewText: 'This game exceeded all my expectations! The attention to detail is amazing and the soundtrack is phenomenal. One of the best games I\'ve played this year.',
    playTime: '80',
    difficulty: 'Hard',
    platform: 'PC',
    tags: ['Indie', 'Puzzle', 'Atmospheric'],
    isPublic: true,
    date: '2024-11-20',
    helpful: 31,
    verified: true,
  },
  {
    id: 'review5',
    gameId: '1942',
    gameName: 'The Witcher 3: Wild Hunt',
    userId: 'user5',
    username: 'CasualPlayer',
    userAvatar: 'https://images.pexels.com/photos/1040884/pexels-photo-1040884.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'Fun game to play in short sessions. Easy to pick up and put down. The graphics are nice and the controls are intuitive. Good for casual gaming.',
    playTime: '15',
    difficulty: 'Easy',
    platform: 'Nintendo Switch',
    tags: ['Casual', 'Family'],
    isPublic: true,
    date: '2024-11-18',
    helpful: 12,
    verified: false,
  },
  // Additional reviews for variety
  {
    id: 'review6',
    gameId: '1942',
    gameName: 'The Witcher 3: Wild Hunt',
    userId: 'user1',
    username: 'GameMaster99',
    userAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'Solid gameplay with good replay value. The multiplayer mode is especially fun with friends. Some balancing issues but overall enjoyable.',
    playTime: '60',
    difficulty: 'Medium',
    platform: 'PC',
    tags: ['Multiplayer', 'Competitive'],
    isPublic: true,
    date: '2024-11-15',
    helpful: 19,
    verified: true,
  },
  // Additional reviews for different games
  {
    id: 'review7',
    gameId: '1234',
    gameName: 'Cyberpunk 2077',
    userId: 'user2',
    username: 'RetroGamer',
    userAvatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'After all the updates, this game is actually really good now! The story is engaging and Night City looks amazing. Still some bugs but much better than launch.',
    playTime: '75',
    difficulty: 'Medium',
    platform: 'PC',
    tags: ['RPG', 'Sci-Fi', 'Open World'],
    isPublic: true,
    date: '2024-11-12',
    helpful: 22,
    verified: true,
  },
  {
    id: 'review8',
    gameId: '5678',
    gameName: 'Elden Ring',
    userId: 'user3',
    username: 'ProGamer_X',
    userAvatar: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 5,
    reviewText: 'Masterpiece! The open world design is incredible and the combat is so satisfying. Challenging but fair. One of the best games ever made.',
    playTime: '150',
    difficulty: 'Hard',
    platform: 'PlayStation 5',
    tags: ['RPG', 'Souls-like', 'Open World'],
    isPublic: true,
    date: '2024-11-10',
    helpful: 35,
    verified: true,
  },
  {
    id: 'review9',
    gameId: '9012',
    gameName: 'Hades',
    userId: 'user4',
    username: 'IndieLover',
    userAvatar: 'https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 5,
    reviewText: 'Perfect roguelike! The art style is gorgeous, the music is amazing, and the gameplay loop is addictive. Every run feels different.',
    playTime: '60',
    difficulty: 'Medium',
    platform: 'Nintendo Switch',
    tags: ['Roguelike', 'Indie', 'Action'],
    isPublic: true,
    date: '2024-11-08',
    helpful: 28,
    verified: true,
  },
  {
    id: 'review10',
    gameId: '3456',
    gameName: 'God of War',
    userId: 'user1',
    username: 'GameMaster99',
    userAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 5,
    reviewText: 'Incredible storytelling and character development. Kratos and Atreus relationship is beautifully written. Combat is fluid and satisfying.',
    playTime: '40',
    difficulty: 'Medium',
    platform: 'PlayStation 5',
    tags: ['Action', 'Adventure', 'Story'],
    isPublic: true,
    date: '2024-11-05',
    helpful: 42,
    verified: true,
  },
  {
    id: 'review11',
    gameId: '7890',
    gameName: 'The Last of Us Part II',
    userId: 'user5',
    username: 'CasualPlayer',
    userAvatar: 'https://images.pexels.com/photos/1040884/pexels-photo-1040884.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'Emotionally intense and beautifully crafted. The graphics are stunning and the gameplay mechanics are solid. Story is controversial but thought-provoking.',
    playTime: '25',
    difficulty: 'Medium',
    platform: 'PlayStation 5',
    tags: ['Action', 'Survival', 'Story'],
    isPublic: true,
    date: '2024-11-03',
    helpful: 19,
    verified: false,
  },
  {
    id: 'review12',
    gameId: '2468',
    gameName: 'Red Dead Redemption 2',
    userId: 'user2',
    username: 'RetroGamer',
    userAvatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 5,
    reviewText: 'Epic western adventure! The world is incredibly detailed and immersive. Arthur Morgan is one of the best protagonists in gaming history.',
    playTime: '80',
    difficulty: 'Medium',
    platform: 'Xbox Series X',
    tags: ['Open World', 'Action', 'Adventure'],
    isPublic: true,
    date: '2024-11-01',
    helpful: 38,
    verified: true,
  },
  {
    id: 'review13',
    gameId: '1357',
    gameName: 'Ghost of Tsushima',
    userId: 'user3',
    username: 'ProGamer_X',
    userAvatar: 'https://images.pexels.com/photos/1040882/pexels-photo-1040882.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'Beautiful samurai game with stunning visuals. The combat is satisfying and the story is engaging. Open world feels alive and immersive.',
    playTime: '50',
    difficulty: 'Medium',
    platform: 'PlayStation 5',
    tags: ['Action', 'Open World', 'Historical'],
    isPublic: true,
    date: '2024-10-28',
    helpful: 26,
    verified: true,
  },
  {
    id: 'review14',
    gameId: '9753',
    gameName: 'Spider-Man: Miles Morales',
    userId: 'user4',
    username: 'IndieLover',
    userAvatar: 'https://images.pexels.com/photos/1040883/pexels-photo-1040883.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'Great follow-up to the original! Miles\' powers are unique and fun to use. Story is shorter but still engaging. Web-swinging feels amazing.',
    playTime: '15',
    difficulty: 'Easy',
    platform: 'PlayStation 5',
    tags: ['Action', 'Superhero', 'Open World'],
    isPublic: true,
    date: '2024-10-25',
    helpful: 21,
    verified: true,
  },
  {
    id: 'review15',
    gameId: '8642',
    gameName: 'Horizon Zero Dawn',
    userId: 'user1',
    username: 'GameMaster99',
    userAvatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 4,
    reviewText: 'Unique post-apocalyptic world with robot dinosaurs! Aloy is a great protagonist and the combat against machines is thrilling.',
    playTime: '60',
    difficulty: 'Medium',
    platform: 'PC',
    tags: ['Open World', 'Action', 'Sci-Fi'],
    isPublic: true,
    date: '2024-10-22',
    helpful: 33,
    verified: true,
  },
  {
    id: 'review16',
    gameId: '1597',
    gameName: 'Death Stranding',
    userId: 'user5',
    username: 'CasualPlayer',
    userAvatar: 'https://images.pexels.com/photos/1040884/pexels-photo-1040884.jpeg?auto=compress&cs=tinysrgb&w=120&h=120&crop=face',
    rating: 3,
    reviewText: 'Very unique and artistic game. The walking mechanics are surprisingly engaging. Story is complex and philosophical. Not for everyone but worth experiencing.',
    playTime: '35',
    difficulty: 'Hard',
    platform: 'PC',
    tags: ['Action', 'Sci-Fi', 'Unique'],
    isPublic: true,
    date: '2024-10-20',
    helpful: 15,
    verified: false,
  },
];

export class CommunityService {
  // Get community reviews for a specific game
  static async getGameReviews(gameId: string, limit: number = 10): Promise<CommunityReview[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const gameReviews = mockCommunityReviews.filter(review => review.gameId === gameId);
    
    // Sort by helpful votes (most helpful first)
    return gameReviews
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, limit);
  }

  // Get all community reviews (for discovery)
  static async getAllReviews(limit: number = 20): Promise<CommunityReview[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCommunityReviews
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Get user profile by ID
  static async getUserProfile(userId: string): Promise<CommunityUser | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return mockUsers.find(user => user.id === userId) || null;
  }

  // Get reviews by user
  static async getUserReviews(userId: string, limit: number = 10): Promise<CommunityReview[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCommunityReviews
      .filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  // Get trending reviews
  static async getTrendingReviews(limit: number = 10): Promise<CommunityReview[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCommunityReviews
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, limit);
  }

  // Get recent reviews
  static async getRecentReviews(limit: number = 10): Promise<CommunityReview[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCommunityReviews
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }
}

export default CommunityService;
