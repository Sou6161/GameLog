import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameController, EnvelopeSimple, Lock, User } from 'phosphor-react-native';
import { useAuth } from '@/hooks/useAuth';

export function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, username);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0A0F1F', '#22D3EE', '#F43F5E']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <GameController size={60} color="#E2E8F0" weight="bold" />
            <Text style={styles.logoText}>GameLog</Text>
            <Text style={styles.tagline}>Track • Discover • Share</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>
              {isLogin ? 'Welcome Back' : 'Join GameLog'}
            </Text>

            {!isLogin && (
              <View style={styles.inputContainer}>
                <User size={20} color="#94A3B8" weight="bold" />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#94A3B8"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <EnvelopeSimple size={20} color="#94A3B8" weight="bold" />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#94A3B8"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#94A3B8" weight="bold" />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity 
              style={styles.submitButton} 
              onPress={handleSubmit}
              disabled={loading}
            >
              <LinearGradient
                colors={['#22D3EE', '#0EA5E9']}
                style={styles.submitGradient}
              >
                <Text style={styles.submitText}>
                  {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchText}>
                {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoText: {
    fontFamily: 'Orbitron_900Black',
    fontSize: 36,
    color: '#E2E8F0',
    textShadowColor: '#22D3EE',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
    marginTop: 16,
  },
  tagline: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#94A3B8',
    letterSpacing: 2,
    marginTop: 8,
  },
  formContainer: {
    backgroundColor: 'rgba(26, 34, 56, 0.8)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
  },
  formTitle: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 24,
    color: '#E2E8F0',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  input: {
    flex: 1,
    marginLeft: 12,
    color: '#E2E8F0',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    color: '#0A0F1F',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: '#22D3EE',
  },
});