import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { useAuth } from '../context/AuthContext';
import { ForgotPasswordModal } from '../components/Auth/ForgotPasswordModal';

interface AuthScreenProps {
  visible: boolean;
  onClose: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ visible, onClose }) => {
  const { login, register } = useAuth();

  // Mode: 'login' | 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password Security Criteria (Dynamic live checks)
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber && hasSpecialChar;
  const doPasswordsMatch = password.length > 0 && password === confirmPassword;

  // Reset form
  const resetForm = () => {
    setEmail('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setTermsAccepted(false);
    setErrorMessage(null);
  };

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrorMessage(null);
  };

  // Submit Login
  const handleLoginSubmit = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password) {
      setErrorMessage('Ingresa tu correo o usuario y tu contraseña.');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      resetForm();
      onClose();
    } else {
      setErrorMessage(result.error || 'Error al iniciar sesión.');
    }
  };

  // Submit Register
  const handleRegisterSubmit = async () => {
    setErrorMessage(null);
    if (!email.trim()) {
      setErrorMessage('Ingresa un correo electrónico.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Elige un nombre de usuario.');
      return;
    }
    if (!isPasswordValid) {
      setErrorMessage('La contraseña debe cumplir todos los requisitos de seguridad.');
      return;
    }
    if (!doPasswordsMatch) {
      setErrorMessage('Las contraseñas no coinciden.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Acepta los términos y condiciones.');
      return;
    }

    setIsLoading(true);
    const result = await register(email, username, password, termsAccepted);
    setIsLoading(false);

    if (result.success) {
      resetForm();
      onClose();
    } else {
      setErrorMessage(result.error || 'Error al registrar la cuenta.');
    }
  };

  const handleForgotPassword = () => {
    setIsForgotPasswordOpen(true);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Decorative Background Elements */}
        <View style={styles.bgCircleTopLeft} />
        <View style={styles.bgCircleTopRight} />
        <View style={styles.bgCircleBottom} />

        <View style={styles.centerContainer}>
          {/* Logo and Brand Header (Prominent & Centered) */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/logoappE.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Logo Entre Nosotros"
            />
            <Text style={styles.brandTitle}>
              {mode === 'login' ? 'Bienvenido de nuevo' : 'Crear Cuenta'}
            </Text>
          </View>

          {/* Auth Card Container */}
          <View style={styles.cardContainer}>
            {/* Mode Switcher Tabs */}
            <View style={styles.segmentedControl}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  mode === 'login' && styles.segmentButtonActive,
                ]}
                onPress={() => handleSwitchMode('login')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'login' && styles.segmentTextActive,
                  ]}
                >
                  Iniciar Sesión
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  mode === 'register' && styles.segmentButtonActive,
                ]}
                onPress={() => handleSwitchMode('register')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.segmentText,
                    mode === 'register' && styles.segmentTextActive,
                  ]}
                >
                  Registrarse
                </Text>
              </TouchableOpacity>
            </View>

            {/* Error Message Box */}
            {errorMessage && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color="#A33A2B" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* LOGIN FORM */}
            {mode === 'login' ? (
              <View style={styles.formContainer}>
                {/* Email or Username */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Correo electrónico o Usuario</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={18} color={colors.coffeeMedium} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Contraseña</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed-outline" size={18} color={colors.coffeeMedium} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={18}
                        color={colors.coffeeMedium}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                <TouchableOpacity
                  onPress={handleForgotPassword}
                  style={styles.forgotPasswordContainer}
                  activeOpacity={0.7}
                >
                  <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
                </TouchableOpacity>

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleLoginSubmit}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              /* REGISTER FORM - COMPACT & BEAUTIFUL */
              <View style={styles.formContainer}>
                {/* Email */}
                <View style={styles.inputGroupCompact}>
                  <Text style={styles.inputLabel}>Correo electrónico</Text>
                  <View style={styles.inputWrapperCompact}>
                    <Ionicons name="mail-outline" size={17} color={colors.coffeeMedium} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </View>

                {/* Username */}
                <View style={styles.inputGroupCompact}>
                  <Text style={styles.inputLabel}>Nombre de usuario</Text>
                  <View style={styles.inputWrapperCompact}>
                    <Ionicons name="person-outline" size={17} color={colors.coffeeMedium} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroupCompact}>
                  <Text style={styles.inputLabel}>Contraseña</Text>
                  <View style={styles.inputWrapperCompact}>
                    <Ionicons name="lock-closed-outline" size={17} color={colors.coffeeMedium} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={17}
                        color={colors.coffeeMedium}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Compact 2x2 Password Security Checklist Grid */}
                <View style={styles.compactChecklistGrid}>
                  <View style={styles.checkItemRow}>
                    <Ionicons
                      name={hasMinLength ? 'checkmark-circle' : 'ellipse-outline'}
                      size={13}
                      color={hasMinLength ? '#2E7D32' : colors.textMuted}
                    />
                    <Text style={[styles.checkItemLabel, hasMinLength && styles.checkItemLabelValid]}>
                      8+ caracteres
                    </Text>
                  </View>
                  <View style={styles.checkItemRow}>
                    <Ionicons
                      name={hasUpperCase ? 'checkmark-circle' : 'ellipse-outline'}
                      size={13}
                      color={hasUpperCase ? '#2E7D32' : colors.textMuted}
                    />
                    <Text style={[styles.checkItemLabel, hasUpperCase && styles.checkItemLabelValid]}>
                      1 mayúscula
                    </Text>
                  </View>
                  <View style={styles.checkItemRow}>
                    <Ionicons
                      name={hasNumber ? 'checkmark-circle' : 'ellipse-outline'}
                      size={13}
                      color={hasNumber ? '#2E7D32' : colors.textMuted}
                    />
                    <Text style={[styles.checkItemLabel, hasNumber && styles.checkItemLabelValid]}>
                      1 número
                    </Text>
                  </View>
                  <View style={styles.checkItemRow}>
                    <Ionicons
                      name={hasSpecialChar ? 'checkmark-circle' : 'ellipse-outline'}
                      size={13}
                      color={hasSpecialChar ? '#2E7D32' : colors.textMuted}
                    />
                    <Text style={[styles.checkItemLabel, hasSpecialChar && styles.checkItemLabelValid]}>
                      1 símbolo (!@#$)
                    </Text>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroupCompact}>
                  <View style={styles.labelWithStatus}>
                    <Text style={styles.inputLabel}>Confirmar contraseña</Text>
                    {confirmPassword.length > 0 && (
                      <Text style={[styles.matchStatus, { color: doPasswordsMatch ? '#2E7D32' : '#C62828' }]}>
                        {doPasswordsMatch ? '✓ Coinciden' : '✗ No coinciden'}
                      </Text>
                    )}
                  </View>
                  <View style={styles.inputWrapperCompact}>
                    <Ionicons name="lock-closed-outline" size={17} color={colors.coffeeMedium} style={styles.inputIcon} />
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeButton}
                    >
                      <Ionicons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={17}
                        color={colors.coffeeMedium}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Terms and Conditions Checkbox */}
                <TouchableOpacity
                  style={styles.compactTermsContainer}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.checkbox,
                      termsAccepted && styles.checkboxActive,
                    ]}
                  >
                    {termsAccepted && (
                      <Ionicons name="checkmark" size={13} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.compactTermsText}>
                    Acepto los términos y condiciones de Entre Nosotros
                  </Text>
                </TouchableOpacity>

                {/* Register Button */}
                <TouchableOpacity
                  style={styles.primaryButtonCompact}
                  onPress={handleRegisterSubmit}
                  disabled={isLoading}
                  activeOpacity={0.85}
                >
                  {isLoading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Password Reset Modal */}
      <ForgotPasswordModal
        visible={isForgotPasswordOpen}
        initialEmail={email}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccess={() => {
          setIsForgotPasswordOpen(false);
          setMode('login');
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgCircleTopLeft: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F3EAE3',
    opacity: 0.75,
  },
  bgCircleTopRight: {
    position: 'absolute',
    top: 30,
    right: -60,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#EFE5DD',
    opacity: 0.65,
  },
  bgCircleBottom: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F0E7DF',
    opacity: 0.6,
  },
  centerContainer: {
    width: '100%',
    maxWidth: 390,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: {
    width: 200,
    height: 52,
    marginBottom: 2,
  },
  brandTitle: {
    fontSize: 14,
    color: colors.coffeeDark,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.full,
    padding: 3,
    marginBottom: 14,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: spacing.borderRadius.full,
  },
  segmentButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.coffeeDeep,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.coffeePrimary,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F5C6CB',
  },
  errorText: {
    color: '#A33A2B',
    fontSize: 11.5,
    marginLeft: 6,
    flex: 1,
    fontWeight: '500',
  },
  formContainer: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 11,
  },
  inputGroupCompact: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.coffeeDark,
    marginBottom: 4,
  },
  labelWithStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    height: 42,
  },
  inputWrapperCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 10,
    height: 38,
  },
  inputIcon: {
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    color: colors.textPrimary,
    height: '100%',
  },
  eyeButton: {
    padding: 3,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    paddingVertical: 1,
  },
  forgotPasswordText: {
    fontSize: 11.5,
    color: colors.coffeePrimary,
    fontWeight: '600',
  },
  compactChecklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '49%',
    marginVertical: 2,
  },
  checkItemLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginLeft: 4,
  },
  checkItemLabelValid: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  compactTermsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.coffeeMedium,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxActive: {
    backgroundColor: colors.coffeePrimary,
    borderColor: colors.coffeePrimary,
  },
  compactTermsText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 14,
  },
  primaryButton: {
    backgroundColor: colors.coffeePrimary,
    borderRadius: spacing.borderRadius.full,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonCompact: {
    backgroundColor: colors.coffeePrimary,
    borderRadius: spacing.borderRadius.full,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: colors.coffeePrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
