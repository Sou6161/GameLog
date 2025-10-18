import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  Warning,
  Trash,
  ArrowsClockwise,
  SignOut,
  Info,
  CheckCircle,
  X,
} from 'phosphor-react-native';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  icon?: React.ComponentType<any>;
}

const { width } = Dimensions.get('window');

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  icon: CustomIcon,
}: ConfirmationModalProps) {
  const getTypeConfig = () => {
    switch (type) {
      case 'danger':
        return {
          icon: Trash,
          iconColor: '#FF4757',
          gradientColors: ['#FF4757', '#E11D48'],
          confirmBg: '#FF4757',
        };
      case 'info':
        return {
          icon: Info,
          iconColor: '#00D2FF',
          gradientColors: ['#00D2FF', '#6c5ce7'],
          confirmBg: '#00D2FF',
        };
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: '#22C55E',
          gradientColors: ['#22C55E', '#16A34A'],
          confirmBg: '#22C55E',
        };
      default: // warning
        return {
          icon: Warning,
          iconColor: '#F59E0B',
          gradientColors: ['#F59E0B', '#D97706'],
          confirmBg: '#F59E0B',
        };
    }
  };

  const config = getTypeConfig();
  const IconComponent = CustomIcon || config.icon;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60">
        <BlurView
          intensity={20}
          tint="dark"
          className="absolute inset-0"
        />
        
        <View 
          className="bg-[#1A1A2E] rounded-3xl mx-6 overflow-hidden border border-[#374151]"
          style={{ width: width - 48 }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={config.gradientColors}
            className="px-6 py-4"
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full bg-white/20 justify-center items-center mr-4">
                  <IconComponent
                    size={24}
                    color="#FFFFFF"
                    weight="fill"
                  />
                </View>
                <Text className="text-white text-xl font-bold flex-1">
                  {title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full bg-white/20 justify-center items-center"
              >
                <X size={18} color="#FFFFFF" weight="bold" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Content */}
          <View className="px-6 py-6">
            <Text className="text-[#94A3B8] text-base leading-6 mb-6">
              {message}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 bg-[#374151] rounded-xl py-4 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  {cancelText}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1 rounded-xl py-4 items-center"
                style={{ backgroundColor: config.confirmBg }}
              >
                <Text className="text-white font-semibold text-base">
                  {confirmText}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
