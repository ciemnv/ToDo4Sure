import { StyleSheet, Text, View } from 'react-native';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kalendarz</Text>
      <Text>Tu będzie podstawowy widok kalendarza</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});