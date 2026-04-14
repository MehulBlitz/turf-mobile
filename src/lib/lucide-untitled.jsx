import React from 'react';
import {
  AlertCircle as AlertCircleIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Bell01 as BellIcon,
  Briefcase01 as BriefcaseIcon,
  Calendar as CalendarIcon,
  CalendarDate as CalendarDaysIcon,
  Camera01 as CameraIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  ChevronDown as ChevronDownIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Clock as ClockIcon,
  Copy01 as CopyIcon,
  CurrencyDollar as DollarSignIcon,
  Database01 as DatabaseIcon,
  Download01 as DownloadIcon,
  Edit02 as EditIcon,
  Heart as HeartIcon,
  HomeLine as HomeIcon,
  Image01 as ImageIcon,
  InfoCircle as InfoIcon,
  LayoutGrid01 as LayoutDashboardIcon,
  Loading01 as LoaderIcon,
  Lock01 as LockIcon,
  LogOut01 as LogOutIcon,
  Mail01 as MailIcon,
  MessageChatSquare as MessageSquareIcon,
  MessageCircle01 as MessageCircleIcon,
  Plus as PlusIcon,
  QrCode01 as QrCodeIcon,
  Save01 as SaveIcon,
  SearchLg as SearchIcon,
  Settings01 as SettingsIcon,
  Share06 as ShareIcon,
  Sliders04 as SlidersIcon,
  Star01 as StarIcon,
  Stars02 as SparklesIcon,
  Trash02 as TrashIcon,
  Trophy01 as TrophyIcon,
  Upload01 as UploadIcon,
  User01 as UserIcon,
  Users01 as UsersIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  X as XIcon,
  XCircle as XCircleIcon,
} from '@untitledui/icons';

const adaptIcon = (IconComponent, displayName) => {
  const AdaptedIcon = React.forwardRef(function AdaptedIcon(
    {
      size = 24,
      color = 'currentColor',
      className,
      strokeWidth,
      absoluteStrokeWidth,
      ...props
    },
    ref,
  ) {
    return (
      <IconComponent
        ref={ref}
        width={size}
        height={size}
        color={color}
        strokeWidth={strokeWidth}
        vectorEffect={absoluteStrokeWidth ? 'non-scaling-stroke' : undefined}
        className={className}
        {...props}
      />
    );
  });

  AdaptedIcon.displayName = displayName;
  return AdaptedIcon;
};

export const AlertCircle = adaptIcon(AlertCircleIcon, 'AlertCircle');
export const ArrowLeft = adaptIcon(ArrowLeftIcon, 'ArrowLeft');
export const ArrowRight = adaptIcon(ArrowRightIcon, 'ArrowRight');
export const Bell = adaptIcon(BellIcon, 'Bell');
export const Briefcase = adaptIcon(BriefcaseIcon, 'Briefcase');
export const Calendar = adaptIcon(CalendarIcon, 'Calendar');
export const CalendarDays = adaptIcon(CalendarDaysIcon, 'CalendarDays');
export const Camera = adaptIcon(CameraIcon, 'Camera');
export const Check = adaptIcon(CheckIcon, 'Check');
export const CheckCircle2 = adaptIcon(CheckCircleIcon, 'CheckCircle2');
export const ChevronDown = adaptIcon(ChevronDownIcon, 'ChevronDown');
export const ChevronLeft = adaptIcon(ChevronLeftIcon, 'ChevronLeft');
export const ChevronRight = adaptIcon(ChevronRightIcon, 'ChevronRight');
export const Clock = adaptIcon(ClockIcon, 'Clock');
export const Copy = adaptIcon(CopyIcon, 'Copy');
export const Database = adaptIcon(DatabaseIcon, 'Database');
export const DollarSign = adaptIcon(DollarSignIcon, 'DollarSign');
export const Download = adaptIcon(DownloadIcon, 'Download');
export const Edit2 = adaptIcon(EditIcon, 'Edit2');
export const Heart = adaptIcon(HeartIcon, 'Heart');
export const Home = adaptIcon(HomeIcon, 'Home');
export const Image = adaptIcon(ImageIcon, 'Image');
export const Info = adaptIcon(InfoIcon, 'Info');
export const LayoutDashboard = adaptIcon(LayoutDashboardIcon, 'LayoutDashboard');
export const Loader2 = adaptIcon(LoaderIcon, 'Loader2');
export const Lock = adaptIcon(LockIcon, 'Lock');
export const LogOut = adaptIcon(LogOutIcon, 'LogOut');
export const Mail = adaptIcon(MailIcon, 'Mail');
export const MessageCircle = adaptIcon(MessageCircleIcon, 'MessageCircle');
export const MessageSquare = adaptIcon(MessageSquareIcon, 'MessageSquare');
export const Plus = adaptIcon(PlusIcon, 'Plus');
export const QrCode = adaptIcon(QrCodeIcon, 'QrCode');
export const Save = adaptIcon(SaveIcon, 'Save');
export const Search = adaptIcon(SearchIcon, 'Search');
export const Settings = adaptIcon(SettingsIcon, 'Settings');
export const Share2 = adaptIcon(ShareIcon, 'Share2');
export const Sliders = adaptIcon(SlidersIcon, 'Sliders');
export const Sparkles = adaptIcon(SparklesIcon, 'Sparkles');
export const Star = adaptIcon(StarIcon, 'Star');
export const Trash2 = adaptIcon(TrashIcon, 'Trash2');
export const Trophy = adaptIcon(TrophyIcon, 'Trophy');
export const Upload = adaptIcon(UploadIcon, 'Upload');
export const User = adaptIcon(UserIcon, 'User');
export const Users = adaptIcon(UsersIcon, 'Users');
export const Wifi = adaptIcon(WifiIcon, 'Wifi');
export const WifiOff = adaptIcon(WifiOffIcon, 'WifiOff');
export const X = adaptIcon(XIcon, 'X');
export const XCircle = adaptIcon(XCircleIcon, 'XCircle');
