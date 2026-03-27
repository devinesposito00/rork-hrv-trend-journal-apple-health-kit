import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Heart, Shield, TrendingUp, FileText, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

const ONBOARDING_STEPS = [
  {
    icon: Heart,
    iconColor: Colors.primary,
    title: 'Track Your HRV',
    description: 'Heart Rate Variability (HRV) reflects your body\'s recovery and stress response. Higher HRV often indicates better recovery.',
  },
  {
    icon: FileText,
    iconColor: Colors.secondary,
    title: 'Add Context',
    description: 'Tag factors like sleep, training, alcohol, or stress to understand what affects your HRV over time.',
  },
  {
    icon: TrendingUp,
    iconColor: Colors.accent,
    title: 'Discover Patterns',
    description: 'See trends and correlations in your data. Find out which lifestyle factors impact your recovery most.',
  },
  {
    icon: Shield,
    iconColor: Colors.success,
    title: 'Private & Local',
    description: 'All your data stays on your device. No accounts, no cloud, no tracking. Your wellness journey is yours alone.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { updateSettings } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateSettings({ hasSeenOnboarding: true });
    router.replace('/(tabs)');
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const IconComponent = step.icon;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {!isLastStep && (
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: step.iconColor + '15' }]}>
          <IconComponent size={48} color={step.iconColor} />
        </View>

        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        {isLastStep && (
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerTitle}>Important</Text>
            <Text style={styles.disclaimerText}>
              This app is for wellness tracking only and does not provide medical advice. 
              HRV data should not be used to diagnose, treat, or prevent any disease.
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.dot,
                index === currentStep && styles.dotActive
              ]}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.nextButton} 
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isLastStep ? 'Get Started' : 'Continue'}
          </Text>
          <ChevronRight size={20} color={Colors.textInverse} />
        </TouchableOpacity>

        {isLastStep && (
          <Text style={styles.healthKitNote}>
            Demo mode: Using simulated HRV data.{'\n'}
            Real HealthKit integration requires a custom build.
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    minHeight: 44,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  disclaimer: {
    marginTop: 32,
    backgroundColor: Colors.warningLight,
    padding: 16,
    borderRadius: 12,
    width: '100%',
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.warning,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  healthKitNote: {
    marginTop: 16,
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
