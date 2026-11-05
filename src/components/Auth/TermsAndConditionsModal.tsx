import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';

interface TermsAndConditionsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsAndConditionsModal: React.FC<TermsAndConditionsModalProps> = ({
  visible,
  onClose,
  onAccept,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.documentSheet}>
          {/* Top Document Bar */}
          <View style={styles.topBar}>
            <Text style={styles.topBarDocLabel}>DOCUMENTO LEGAL</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeTextBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeTextBtnLabel}>Cerrar [X]</Text>
            </TouchableOpacity>
          </View>

          {/* Formal Document Body */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.docMainTitle}>
              TÉRMINOS Y CONDICIONES DE USO Y AVISO DE PRIVACIDAD
            </Text>
            <Text style={styles.docSubTitle}>
              PLATAFORMA COMUNITARIA DE BIENESTAR EMOCIONAL "ENTRE NOSOTROS"
            </Text>
            <Text style={styles.docDate}>
              Última actualización: Noviembre de 2026
            </Text>

            <View style={styles.divider} />

            <View style={styles.noticeBox}>
              <Text style={styles.noticeTitle}>
                AVISO ESENCIAL DE SALUD Y EMERGENCIAS
              </Text>
              <Text style={styles.paragraph}>
                Entre Nosotros y su acompañante virtual ANIMA son herramientas de apoyo comunitario, expresión emocional y acompañamiento preventivo. No sustituyen bajo ninguna circunstancia la atención psicológica, psiquiátrica o médica profesional, ni constituyen un servicio de atención a crisis o emergencias.
              </Text>
            </View>

            <Text style={styles.sectionHeading}>
              1. ACEPTACIÓN DE LOS TÉRMINOS
            </Text>
            <Text style={styles.paragraph}>
              Al crear una cuenta, acceder o utilizar la aplicación móvil y plataforma web Entre Nosotros (en adelante, la "Plataforma"), usted (en adelante, el "Usuario") reconoce haber leído, comprendido y aceptado sujetarse a los presentes Términos y Condiciones de Uso, así como a las Reglas de la Comunidad y al Aviso de Privacidad. Si no está de acuerdo con alguno de estos términos, deberá abstenerse de registrarse o utilizar la Plataforma.
            </Text>

            <Text style={styles.sectionHeading}>
              2. PROPÓSITO DE LA PLATAFORMA Y ALCANCE DEL SERVICIO
            </Text>
            <Text style={styles.paragraph}>
              Entre Nosotros es un espacio digital diseñado para fomentar el bienestar emocional, la empatía y el apoyo mutuo mediante los siguientes módulos:
            </Text>
            <Text style={styles.listItem}>
              2.1. Muro Comunitario (Principal): Publicación de reflexiones, experiencias, fotografías, videos, audios y comentarios de apoyo entre miembros.
            </Text>
            <Text style={styles.listItem}>
              2.2. ANIMA (Acompañante Emocional con Inteligencia Artificial): Asistente conversacional automatizado orientado a la escucha activa, validación emocional y sugerencia de ejercicios de calma.
            </Text>
            <Text style={styles.listItem}>
              2.3. Ruta Interactiva de 7 Días (Mi Racha e Insignias): Cuestionario orientativo de estado de ánimo que propone actividades cotidianas de bienestar personal y permite compartir evidencias fotográficas de superación en la comunidad.
            </Text>
            <Text style={styles.listItem}>
              2.4. Registro Semanal de Emociones y Blog de Concienciación: Herramientas de seguimiento personal e información psicoeducativa.
            </Text>
            <Text style={styles.listItem}>
              2.5. Directorio de Psicólogos y Recursos de Apoyo: Información de contacto de profesionales de la salud mental y líneas de ayuda.
            </Text>

            <Text style={styles.sectionHeading}>
              3. DESLINDE DE RESPONSABILIDAD MÉDICA Y PSICOLÓGICA
            </Text>
            <Text style={styles.listItem}>
              3.1. No es un servicio médico ni clínico: Ningún contenido, cuestionario, resultado de racha, frase motivacional, publicación de usuario o respuesta generada por ANIMA constituye un diagnóstico clínico, dictamen psicológico, psicoterapia o prescripción médica.
            </Text>
            <Text style={styles.listItem}>
              3.2. Limitaciones de ANIMA: El Usuario comprende que ANIMA es un sistema de inteligencia artificial y no un profesional humano de la salud. Sus respuestas tienen fines exclusivamente de acompañamiento empático y orientación general.
            </Text>
            <Text style={styles.listItem}>
              3.3. Situaciones de Crisis o Emergencia: Si el Usuario experimenta pensamientos de autolesión, ideación suicida o una emergencia médica o psicológica, se compromete a acudir de inmediato a los servicios de emergencia de su localidad (como el 911 o la Línea de la Vida 800 911 2000 en México) o contactar a un especialista certificado.
            </Text>
            <Text style={styles.listItem}>
              3.4. Profesionales Externos: El directorio de psicólogos incluido en la Plataforma tiene carácter informativo. La relación terapéutica que, en su caso, el Usuario establezca con algún especialista externo es independiente de Entre Nosotros.
            </Text>

            <Text style={styles.sectionHeading}>
              4. REQUISITOS DE REGISTRO Y SEGURIDAD DE LA CUENTA
            </Text>
            <Text style={styles.listItem}>
              4.1. Edad Mínima: Para registrarse en la Plataforma, el Usuario declara tener al menos 15 años de edad o contar con la supervisión y autorización de sus padres o tutores legales conforme a la legislación aplicable.
            </Text>
            <Text style={styles.listItem}>
              4.2. Veracidad y Resguardo: El Usuario se compromete a proporcionar un correo electrónico válido y a mantener la confidencialidad de su contraseña. Toda actividad realizada desde su cuenta será de su exclusiva responsabilidad.
            </Text>
            <Text style={styles.listItem}>
              4.3. Identidad Respetuosa: El Usuario puede elegir un nombre de usuario o seudónimo para proteger su privacidad, siempre que no suplante la identidad de terceros ni utilice denominaciones ofensivas.
            </Text>

            <Text style={styles.sectionHeading}>
              5. CÓDIGO DE CONDUCTA Y REGLAS DE LA COMUNIDAD
            </Text>
            <Text style={styles.paragraph}>
              Para preservar un entorno seguro y libre de violencia, el Usuario se obliga a no publicar, transmitir ni compartir contenido que:
            </Text>
            <Text style={styles.listItem}>
              a) Promueva, incite o glorifique el suicidio, la autolesión, los trastornos de la conducta alimentaria o conductas de riesgo para la vida.
            </Text>
            <Text style={styles.listItem}>
              b) Contenga acoso, discursos de odio, discriminación, amenazas, burlas o ataques personales hacia cualquier miembro de la comunidad.
            </Text>
            <Text style={styles.listItem}>
              c) Incluya material sexualmente explícito, pornográfico, violento o ilegal.
            </Text>
            <Text style={styles.listItem}>
              d) Vulnere la privacidad de terceros mediante la difusión de datos personales, teléfonos, direcciones o fotografías de otras personas sin su consentimiento.
            </Text>
            <Text style={styles.listItem}>
              e) Constituya spam, fraude, publicidad comercial no autorizada o desinformación médica peligrosa.
            </Text>
            <Text style={styles.paragraph}>
              Moderación y Suspensión: Entre Nosotros se reserva el derecho de eliminar publicaciones, ocultar comentarios o suspender de forma temporal o definitiva las cuentas que infrinjan estas normas, sin necesidad de previo aviso.
            </Text>

            <Text style={styles.sectionHeading}>
              6. CONTENIDO GENERADO POR EL USUARIO Y EVIDENCIAS DE "MI RACHA"
            </Text>
            <Text style={styles.listItem}>
              6.1. Titularidad: El Usuario conserva la propiedad intelectual sobre las fotografías, textos, audios y videos que publique en la Plataforma.
            </Text>
            <Text style={styles.listItem}>
              6.2. Licencia de Uso dentro de la Comunidad: Al publicar en el muro principal o al registrar una fotografía de evidencia dentro de la dinámica "Mi Racha de 7 Días", el Usuario otorga a Entre Nosotros una licencia no exclusiva, gratuita y revocable para mostrar dicho contenido dentro del flujo comunitario de la Plataforma.
            </Text>
            <Text style={styles.listItem}>
              6.3. Eliminación de Contenido: El Usuario puede editar o eliminar sus publicaciones en cualquier momento desde las opciones de cada publicación o desde su perfil.
            </Text>

            <Text style={styles.sectionHeading}>
              7. PRIVACIDAD Y PROTECCIÓN DE DATOS PERSONALES
            </Text>
            <Text style={styles.listItem}>
              7.1. Datos Recopilados: Se recopilan únicamente los datos necesarios para el funcionamiento de la Plataforma: correo electrónico, nombre de usuario, foto de perfil y portada (opcionales), publicaciones comunitarias, registros de estado de ánimo, avances de racha e interacciones dentro de la aplicación.
            </Text>
            <Text style={styles.listItem}>
              7.2. Finalidad del Tratamiento: Los datos se utilizan exclusivamente para autenticar y sincronizar la cuenta del Usuario, personalizar su ruta de actividades de 7 días e insignias, y mostrar sus publicaciones cuando el Usuario decide compartirlas en la comunidad.
            </Text>
            <Text style={styles.listItem}>
              7.3. No Comercialización de Datos: Entre Nosotros nunca vende, alquila ni comercializa los datos personales ni emocionales de sus usuarios a terceros con fines publicitarios.
            </Text>
            <Text style={styles.listItem}>
              7.4. Derechos del Titular: El Usuario puede actualizar la información de su perfil en cualquier momento o solicitar la eliminación definitiva de su cuenta y sus datos asociados a través de los canales de soporte de la Plataforma.
            </Text>

            <Text style={styles.sectionHeading}>
              8. DISPONIBILIDAD DEL SERVICIO Y MODIFICACIONES
            </Text>
            <Text style={styles.listItem}>
              8.1. Disponibilidad: Entre Nosotros realiza sus mejores esfuerzos para mantener la Plataforma operativa de forma continua, sin garantizar la ausencia de interrupciones técnicas o mantenimientos programados.
            </Text>
            <Text style={styles.listItem}>
              8.2. Actualizaciones: Nos reservamos el derecho de actualizar los presentes Términos y Condiciones para reflejar mejoras en la Plataforma o cambios normativos, notificándolo a través de la aplicación.
            </Text>

            <Text style={styles.sectionHeading}>
              9. CONSENTIMIENTO EXPRESO AL REGISTRARSE
            </Text>
            <Text style={styles.paragraph}>
              Al marcar la casilla de aceptación y completar el registro, el Usuario declara haber leído y comprendido íntegramente el presente documento, manifestando su conformidad con los Términos y Condiciones de Uso, las Reglas de la Comunidad y el Aviso de Privacidad de Entre Nosotros.
            </Text>

            <View style={styles.divider} />

            {/* Bottom Formal Actions */}
            <View style={styles.bottomActionsRow}>
              <TouchableOpacity
                style={styles.secondaryCloseBtn}
                onPress={onClose}
                activeOpacity={0.75}
              >
                <Text style={styles.secondaryCloseBtnText}>Cerrar</Text>
              </TouchableOpacity>

              {onAccept && (
                <TouchableOpacity
                  style={styles.acceptBlackBtn}
                  onPress={() => {
                    onAccept();
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.acceptBlackBtnText}>
                    Aceptar términos y continuar
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    zIndex: 99999,
    elevation: 99999,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 20,
  },
  safeArea: {
    width: '100%',
    maxWidth: 680,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
  },
  documentSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  topBarDocLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 1,
  },
  closeTextBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  closeTextBtnLabel: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#000000',
  },
  scrollArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 22,
    backgroundColor: '#FFFFFF',
  },
  docMainTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 6,
  },
  docSubTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  docDate: {
    fontSize: 11,
    fontWeight: '400',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#000000',
    marginVertical: 14,
  },
  noticeBox: {
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 16,
  },
  noticeTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#000000',
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#000000',
    marginTop: 14,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 19,
    marginBottom: 8,
    textAlign: 'justify',
  },
  listItem: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    lineHeight: 19,
    marginBottom: 6,
    paddingLeft: 10,
    textAlign: 'justify',
  },
  bottomActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  secondaryCloseBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#FFFFFF',
  },
  secondaryCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  acceptBlackBtn: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#000000',
    backgroundColor: '#000000',
  },
  acceptBlackBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
