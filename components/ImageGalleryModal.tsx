import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  StatusBar as RNStatusBar,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  clamp,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'phosphor-react-native';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ImageGalleryModalProps {
  visible: boolean;
  images: Array<{ id: number; url: string }>;
  initialIndex: number;
  onClose: () => void;
}

export default function ImageGalleryModal({ 
  visible, 
  images, 
  initialIndex, 
  onClose 
}: ImageGalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const isManualNavigation = useRef(false);
  
  // Zoom and pan values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Reset transform values
  const resetTransform = () => {
    scale.value = withSpring(1);
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  };

  // Update current index when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      resetTransform();
      // Scroll to initial index after a small delay to ensure FlatList is ready
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({ 
          index: initialIndex, 
          animated: false 
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  // Animated style for the image
  const animatedImageStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  // Handle double tap to zoom
  const handleDoubleTap = () => {
    if (scale.value === 1) {
      scale.value = withSpring(2);
    } else {
      resetTransform();
    }
  };

  const renderImage = ({ item, index }: { item: { id: number; url: string }; index: number }) => {
    return (
      <View style={{ width: screenWidth, height: screenHeight, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity activeOpacity={1} onPress={handleDoubleTap} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Animated.View style={[animatedImageStyle]}>
            <Image
              source={{ uri: item.url }}
              style={{
                width: screenWidth * 0.9,
                height: screenHeight * 0.7,
              }}
              resizeMode="contain"
            />
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0 && !isManualNavigation.current) {
      const newIndex = viewableItems[0].index;
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
        setCurrentIndex(newIndex);
        resetTransform();
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  if (!visible || !images || images.length === 0) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar style="light" hidden={true} />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
          <SafeAreaView style={{ flex: 1 }}>
            {/* Header */}
            <View style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              zIndex: 10,
              paddingTop: RNStatusBar.currentHeight || 0 
            }}>
              <BlurView intensity={20} style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <TouchableOpacity onPress={onClose} style={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: 20, 
                    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                    justifyContent: 'center', 
                    alignItems: 'center' 
                  }}>
                    <X size={20} color="#FFFFFF" weight="bold" />
                  </TouchableOpacity>
                  
                  <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
                    {currentIndex + 1} of {images.length}
                  </Text>
                  
                  <View style={{ width: 40 }} />
                </View>
              </BlurView>
            </View>

            {/* Image Gallery */}
            <FlatList
              ref={flatListRef}
              data={images}
              renderItem={renderImage}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              initialScrollIndex={initialIndex}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                console.log('ScrollToIndex failed:', info);
                const wait = new Promise(resolve => setTimeout(resolve, 500));
                wait.then(() => {
                  flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                });
              }}
            />

            {/* Navigation Arrows - Removed for simpler swipe-only navigation */}

            {/* Bottom Controls */}
            <View style={{ 
              position: 'absolute', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              paddingBottom: 20 
            }}>
              <BlurView intensity={20} style={{ paddingHorizontal: 20, paddingVertical: 15 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, opacity: 0.8, textAlign: 'center' }}>
                    Double tap to zoom • Swipe to navigate
                  </Text>
                </View>
                
                {/* Thumbnail Strip */}
                {images.length > 1 && (
                  <View style={{ 
                    flexDirection: 'row', 
                    justifyContent: 'center', 
                    marginTop: 15,
                    gap: 8
                  }}>
                    {images.map((image, index) => (
                      <TouchableOpacity
                        key={image.id}
                        onPress={() => {
                          const targetIndex = index;
                          isManualNavigation.current = true;
                          setCurrentIndex(targetIndex);
                          flatListRef.current?.scrollToIndex({ index: targetIndex, animated: true });
                          resetTransform();
                          // Reset manual navigation flag after animation
                          setTimeout(() => {
                            isManualNavigation.current = false;
                          }, 300);
                        }}
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 8,
                          overflow: 'hidden',
                          borderWidth: index === currentIndex ? 2 : 0,
                          borderColor: '#00D2FF',
                        }}
                      >
                        <Image
                          source={{ uri: image.url }}
                          style={{ width: '100%', height: '100%' }}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </BlurView>
            </View>
          </SafeAreaView>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}