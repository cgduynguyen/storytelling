import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { TextInput } from '../../components/ui/TextInput';
import { Button } from '../../components/ui/Button';
import { ErrorMessage } from '../../components/ui/ErrorMessage';
import { useRegister } from '../../hooks/useAuth';
import { theme } from '../../styles/theme';

/**
 * RegisterScreen
 *
 * User registration screen for new users
 */
export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [childName, setChildName] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    childName?: string;
  }>({});

  const registerMutation = useRegister();

  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      childName?: string;
    } = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Child name validation
    if (!childName.trim()) {
      newErrors.childName = 'Child name is required';
    } else if (childName.trim().length < 2 || childName.trim().length > 50) {
      newErrors.childName = 'Name must be between 2 and 50 characters';
    } else if (!/^[a-zA-Z0-9\s]+$/.test(childName.trim())) {
      newErrors.childName =
        'Name can only contain letters, numbers, and spaces';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email: email.trim(),
        password,
        name: childName.trim(),
      });

      // Navigate to main app
      router.replace('/(tabs)/create');
    } catch (error) {
      // Error is handled by the mutation
      console.error('Registration error:', error);
    }
  };

  const handleGoToLogin = () => {
    router.push('/auth/login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join us to start creating magical stories! ✨
          </Text>
        </View>

        {registerMutation.isError && (
          <ErrorMessage
            message={
              registerMutation.error instanceof Error
                ? registerMutation.error.message
                : 'Registration failed. Please try again.'
            }
            onRetry={registerMutation.reset}
          />
        )}

        <View style={styles.form}>
          <TextInput
            label="Parent's Email"
            value={email}
            onChangeText={(text: string) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            placeholder="parent@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            error={errors.email}
            accessibilityLabel="Email input"
          />

          <TextInput
            label="Child's Name"
            value={childName}
            onChangeText={(text: string) => {
              setChildName(text);
              if (errors.childName)
                setErrors({ ...errors, childName: undefined });
            }}
            placeholder="Enter your child's name"
            autoCapitalize="words"
            autoComplete="name"
            error={errors.childName}
            accessibilityLabel="Child name input"
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={(text: string) => {
              setPassword(text);
              if (errors.password)
                setErrors({ ...errors, password: undefined });
            }}
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            error={errors.password}
            accessibilityLabel="Password input"
          />

          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={(text: string) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors({ ...errors, confirmPassword: undefined });
            }}
            placeholder="Re-enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
            error={errors.confirmPassword}
            accessibilityLabel="Confirm password input"
          />

          <Button
            onPress={handleRegister}
            loading={registerMutation.isPending}
            disabled={registerMutation.isPending}
            style={styles.registerButton}
            accessibilityLabel="Register button"
          >
            {registerMutation.isPending ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity
            onPress={handleGoToLogin}
            accessibilityLabel="Go to login"
            accessibilityRole="button"
          >
            <Text style={styles.linkText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: 16,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  linkText: {
    fontSize: 14,
    color: theme.colors.primary.main,
    fontWeight: '600',
  },
});
