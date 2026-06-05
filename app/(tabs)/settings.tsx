import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ustawienia</Text>
      <Text>Opcje aplikacji i możliwosć personalizacji ustawień.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});