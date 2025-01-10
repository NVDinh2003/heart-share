import { StyledNextButton } from "./../features/register/components/RegisterNextButton/RegisterNextButton";
interface ThemeColors {
  blue: string;
  black: string;
  darkGray: string;
  gray: string;
  lightGray: string;
  white: string;
  error: string;
}

export interface Theme {
  colors: ThemeColors;
}

export interface StyledInputProps {
  active: boolean;
  valid: boolean;
  theme: Theme;
  color?: string;
}

export interface ValidatedInputState {
  active: boolean;
  valid: boolean;
  typedIn: boolean;
  labelActive: boolean;
  labelColor: string;
  value: string;
}

export interface Dob {
  month: number;
  day: number;
  year: number;
}

export interface StyledNextButtonProps {
  active: boolean;
  theme: Theme;
  color: string;
}

export interface StyledCheckboxProps {
  active: boolean;
  theme: Theme;
}

export interface ImageInfo {
  imageId: number;
  imageName: string;
  imageType: string;
  imageURL: string;
}

export interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phone: string;
  dateOfBirth: Dob;
  bio: string;
  nickname: string;
  profilePicture: ImageInfo | null;
  bannerPicture: ImageInfo | null;
  location: string | null;
  verifiedAccount: boolean;
  privateAccount: boolean;
  organization: ImageInfo | null;
  createTimestamp: Date;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface ModalButtonProps {
  active: boolean;
  height: number;
  fontColor: string;
  borderColor?: string;
  backgroundColor: string;
  fontSize: number;
  fontWeight: number;
  hoverBackground: RGBA;
  hoverBorder?: RGBA;
}

export interface SVGProps {
  height: number;
  width: number;
  color?: string;
}

export interface PostImage {
  imageId: number;
  imageName: string;
  imageType: string;
  imageURL: string;
}

export interface Post {
  postId: number;
  content: string;
  postedDate?: Date;
  author: User;
  replies: Post[];
  replyTo?: Post | null;
  likes: User[];
  images: PostImage[];
  poll?: Poll;
  reposts: User[];
  views: User[];
  stars: User[];
  scheduled: boolean;
  scheduledDate?: Date;
  address?: string;
  provinceCode?: string;
  districtCode?: string;
  wardCode?: string;
  audience: "EVERYONE" | "CIRCLE";
  replyRestriction: "EVERYONE" | "FOLLOW" | "CIRCLE" | "MENTION";
}

export interface FeedPost {
  post: Post;
  replyTo: Post | null;
  repost: boolean;
  repostUser: User;
}

export interface Reply {
  author: User;
  originalPost: Post;
  replyContent: string;
  images: PostImage[];
  scheduled: boolean;
  scheduledDate?: Date;
  poll?: Poll;
}

export interface TenorCategories {
  image: string;
  name: string;
  path: string;
  searchterm: string;
}

export interface PollChoice {
  pollChoiceId: number;
  choiceText: string;
  votes: User[];
}

export interface Poll {
  pollId: number;
  endTime: string;
  choices: PollChoice[];
}

export interface Notification {
  notificationId: number;
  notificationType:
    | "NEW_POST"
    | "REPOST"
    | "LIKE"
    | "REPLY"
    | "STAR"
    | "MESSAGE"
    | "FOLLOW"
    | "MENTION";
  notificationTimestamp: string;
  acknowledged: boolean;
  recipient: User;
  actionUser: User;
  post: Post | null;
  reply: Post | null;
  message: Message | null;
}

// Message and Conversation

export interface Reaction {
  messageReactionId: number;
  reactionUser: User;
  reaction: string;
}

export interface Message {
  messageId: number;
  messageType: "MESSAGE" | "ACTION";
  conversationId: number;
  sentAt: Date;
  sentBy: User;
  seenBy: User[];
  messageImage: string;
  messageText: string;
  replyTo: Message | null;
  hiddenBy: User[];
  reactions: Reaction[];
}

export interface Conversation {
  conversationId: number;
  conversationUsers: User[];
  conversationPicture?: string;
  conversationName?: string;
  // messages: Message[];
  conversationMessage: Message[];
}

export interface ConversationUser {
  userId: number;
  pfp: string;
  nickname: string;
}

export interface CreateMessageUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  nickname: string;
  profilePicture: ImageInfo | null;
}

export interface CreateMessageDTO {
  messageType: string;
  sentBy: CreateMessageUser;
  conversation: {
    conversationId: number;
    conversationUsers: CreateMessageUser[];
    conversationPicture?: string;
    conversationName?: string;
    conversationMessage: Array<{
      messageType: string;
      sentBy: CreateMessageUser;
      conversation: { conversationId: number };
      messageText: string;
      messageImage: string | null;
    }>;
  };
  text: string;
  gifUrl: string | null;
}
