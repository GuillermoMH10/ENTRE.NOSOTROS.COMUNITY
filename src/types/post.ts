export type ReactionType = 'teEscucho' | 'teAbrazo' | 'noEstasSolo' | 'fuerza';

export interface ReactionConfig {
  type: ReactionType;
  label: string;
  image: any;
  iconName: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const REACTIONS_MAP: Record<ReactionType, ReactionConfig> = {
  teAbrazo: {
    type: 'teAbrazo',
    label: 'Te abrazo',
    image: require('../../assets/iconsreacciones/teabrazo.png'),
    iconName: 'heart',
    emoji: '🤗',
    color: '#D47355',
    bgColor: '#FFF0EC',
  },
  teEscucho: {
    type: 'teEscucho',
    label: 'Te escucho',
    image: require('../../assets/iconsreacciones/teescucho.png'),
    iconName: 'chatbubble-ellipses',
    emoji: '👂',
    color: '#3B79BA',
    bgColor: '#EDF5FD',
  },
  noEstasSolo: {
    type: 'noEstasSolo',
    label: 'No estás solo',
    image: require('../../assets/iconsreacciones/noestassolo.png'),
    iconName: 'shield-checkmark',
    emoji: '🤝',
    color: '#3F9B65',
    bgColor: '#EEF8F1',
  },
  fuerza: {
    type: 'fuerza',
    label: 'Fuerza',
    image: require('../../assets/iconsreacciones/fuerza.png'),
    iconName: 'flash',
    emoji: '💪',
    color: '#D9822B',
    bgColor: '#FEF6EC',
  },
};

export interface Post {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  imageUrls: string[];
  hashtags: string[];
  reactions: {
    teEscucho: number;
    teAbrazo: number;
    noEstasSolo: number;
    fuerza: number;
  };
  userReactions?: Record<string, ReactionType>;
  commentsCount: number;
  savedBy: string[];
  createdAt: string;
  timestamp: number;
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  text: string;
  imageUrl?: string;
  authorHeart: boolean;
  createdAt: string;
  timestamp: number;
}

export interface HashtagItem {
  id: string;
  tag: string;
  count: number;
}
