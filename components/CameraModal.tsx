import React, { useRef, useState } from 'react';
import { Modal, Text, View, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';


interface CameraModalProps {
  visible: boolean;
  onClose: () => void;
  onCapture: (imageUri: string) => void;
}

export default function CameraModal({ visible, onClose, onCapture }: CameraModalProps) {
  // Hook z expo-camera do zarządzania uprawnieniami (pyta system o dostęp do obiektywu)
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  if (!visible) return null;

  // Jeśli system jeszcze nie zdecydował o uprawnieniach, pokazujemy pusty widok
  if (!permission) {
    return <View />;
  }

  // Jeśli użytkownik nie dał nam dostępu do aparatu, pokazujemy ekran z prośbą
  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="slide">
        <View className="flex-1 justify-center items-center bg-slate-900 p-6">
          <Text className="text-white text-center text-lg mb-6">
            Musisz przyznać dostęp do aparatu, aby móc potwierdzić wykonanie zadania.
          </Text>
          <Pressable 
            className="bg-sky-600 px-6 py-3 rounded-xl active:bg-sky-700"
            onPress={requestPermission}
          >
            <Text className="text-white font-semibold text-base">Przyznaj dostęp</Text>
          </Pressable>
          <Pressable className="mt-4" onPress={onClose}>
            <Text className="text-slate-400 text-base">Anuluj</Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  // Funkcja wykonująca zdjęcie
  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        
        // 1. Aparat robi zdjęcie i zapisuje je w tymczasowym folderze CACHE telefonu
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
        
        if (photo && photo.uri) {
          // 2. Tworzymy unikalną nazwę pliku opartą na aktualnym czasie
          const filename = `photo_${Date.now()}.jpg`;
          
          // 3. Ustalamy stałą, bezpieczną ścieżkę w pamięci naszej aplikacji
          const permanentUri = `${FileSystem.documentDirectory}${filename}`;
          
          // 4. Przenosimy zdjęcie z tymczasowego cache do pamięci stałej telefonu
          await FileSystem.moveAsync({
            from: photo.uri,
            to: permanentUri,
          });

          // 5. Przekazujemy gotową, stałą ścieżkę do ekranu głównego
          onCapture(permanentUri);
        }
      } catch (error) {
        console.error("Problem podczas robienia zdjęcia:", error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  return (
    <Modal visible={visible} animationType="fade">
      <View className="flex-1 bg-black">
        
        {/* Komponent z expo-camera wyświetlający obraz z obiektywu */}
        <CameraView style={{ flex: 1 }} ref={cameraRef}>
          <View className="flex-1 justify-between p-6">
            
            {/* Przycisk X (Zamknij aparat) */}
            <View className="items-end mt-6">
              <Pressable 
                className="bg-black/50 w-10 h-10 rounded-full justify-center items-center"
                onPress={onClose}
              >
                <Text className="text-white font-bold text-lg">✕</Text>
              </Pressable>
            </View>

            {/* Okrągły przycisk migawki na dole */}
            <View className="items-center mb-8">
              <Pressable 
                className={`w-20 h-20 bg-white rounded-full border-4 border-slate-300 justify-center items-center active:scale-95 ${isCapturing ? 'opacity-50' : ''}`}
                onPress={takePicture}
                disabled={isCapturing}
              >
                <View className="w-16 h-16 bg-white rounded-full border-2 border-black" />
              </Pressable>
              <Text className="text-white text-xs mt-2 bg-black/40 px-2 py-1 rounded">
                {isCapturing ? "Zapisywanie..." : "Zrób zdjęcie-dowód"}
              </Text>
            </View>

          </View>
        </CameraView>

      </View>
    </Modal>
  );
}