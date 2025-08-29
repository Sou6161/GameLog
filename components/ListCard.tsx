import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
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
    <TouchableOpacity style={styles.container}>
      <View style={styles.header}>
        <View style={styles.coverMosaic}>
          {list.coverUrls.slice(0, 3).map((url, index) => (
            <Image 
              key={index} 
              source={{ uri: url }} 
              style={[
                styles.coverImage,
                index === 0 && styles.mainCover,
                index > 0 && styles.subCover,
              ]} 
            />
          ))}
        </View>
        
        <View style={styles.listInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.listName}>{list.name}</Text>
            {list.isRanked && (
              <ArrowsDownUp size={16} color="#22D3EE" weight="bold" />
            )}
          </View>
          <Text style={styles.description} numberOfLines={2}>{list.description}</Text>
          <Text style={styles.itemCount}>{list.itemCount} games</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A2238',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  header: {
    flexDirection: 'row',
  },
  coverMosaic: {
    width: 80,
    height: 80,
    position: 'relative',
    marginRight: 16,
  },
  coverImage: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#22D3EE',
  },
  mainCover: {
    width: 50,
    height: 70,
    top: 0,
    left: 0,
    zIndex: 3,
  },
  subCover: {
    width: 35,
    height: 50,
    top: 15,
    right: 0,
    zIndex: 2,
  },
  listInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listName: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 18,
    color: '#22D3EE',
    flex: 1,
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#94A3B8',
    marginVertical: 4,
  },
  itemCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: '#22D3EE',
  },
});