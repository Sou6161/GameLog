import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { ArrowsDownUp, List } from 'phosphor-react-native';

interface List {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  coverUrls: string[];
  isRanked: boolean;
}

interface ListCardProps {
  list: List;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <TouchableOpacity className="bg-[#1A2238] rounded-xl p-4 border border-[#374151]">
      <View className="flex-row">
        <View className="w-20 h-20 relative mr-4">
          {list.coverUrls.slice(0, 3).map((url, index) => (
            <Image 
              key={index} 
              source={{ uri: url }} 
              className={`absolute rounded-lg border border-[#22D3EE] ${
                index === 0 ? 'w-[50px] h-[70px] top-0 left-0 z-[3]' : 'w-[35px] h-[50px] top-[15px] right-0 z-[2]'
              }`} 
            />
          ))}
        </View>
        
        <View className="flex-1 justify-between">
          <View className="flex-row items-center justify-between">
            <Text className="font-bold text-lg text-[#22D3EE] flex-1">{list.name}</Text>
            {list.isRanked && (
              <ArrowsDownUp size={16} color="#22D3EE" weight="bold" />
            )}
          </View>
          <Text className="font-normal text-sm text-[#94A3B8] my-1" numberOfLines={2}>{list.description}</Text>
          <Text className="font-medium text-xs text-[#22D3EE]">{list.itemCount} games</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
