import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, alpha } from '@/constants/theme';
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
        return { icon: Trash, headerBg: colors.red, confirmBg: colors.red };
      case 'info':
        return { icon: Info, headerBg: colors.teal, confirmBg: colors.teal };
      case 'success':
        return { icon: CheckCircle, headerBg: colors.green, confirmBg: colors.green };
      default: // warning
        return { icon: Warning, headerBg: colors.gold, confirmBg: colors.gold };
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
          className="rounded-3xl mx-6 overflow-hidden"
          style={{ width: width - 48, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
        >
          {/* Header (solid) */}
          <View className="px-6 py-4" style={{ backgroundColor: config.headerBg }}>
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 rounded-full justify-center items-center mr-4" style={{ backgroundColor: alpha(colors.void, 0.18) }}>
                  <IconComponent size={24} color={colors.void} weight="fill" />
                </View>
                <Text className="text-xl font-bold flex-1" style={{ color: colors.void }}>
                  {title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full justify-center items-center"
                style={{ backgroundColor: alpha(colors.void, 0.18) }}
              >
                <X size={18} color={colors.void} weight="bold" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Content */}
          <View className="px-6 py-6">
            <Text className="text-base leading-6 mb-6" style={{ color: colors.textDim }}>
              {message}
            </Text>

            {/* Action Buttons */}
            {cancelText && cancelText !== '' ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={onClose}
                  className="flex-1 rounded-xl py-4 items-center"
                  style={{ backgroundColor: colors.elevated }}
                >
                  <Text className="font-semibold text-base" style={{ color: colors.text }}>
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
                  <Text className="font-bold text-base" style={{ color: colors.void }}>
                    {confirmText}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  onConfirm();
                  onClose();
                }}
                className="w-full rounded-xl py-4 items-center"
                style={{ backgroundColor: config.confirmBg }}
              >
                <Text className="font-bold text-base" style={{ color: colors.void }}>
                  {confirmText}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
