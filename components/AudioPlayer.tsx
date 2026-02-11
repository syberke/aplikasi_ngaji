import React, { useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Play, Pause, Volume2, ChevronLeft, ChevronRight } from 'lucide-react-native';

interface AudioPlayerProps {
  fileUrl: string;
  title?: string;
}

export function AudioPlayer({ fileUrl, title }: AudioPlayerProps) {
  // Inisialisasi player
  const player = useAudioPlayer(fileUrl);
  
  // Status menyalurkan currentTime dan duration secara otomatis
  const status = useAudioPlayerStatus(player);
  
  const progressBarWidth = useRef(0);

  const playPause = () => {
    player.playing ? player.pause() : player.play();
  };

  const skip = (seconds: number) => {
    if (status.duration > 0) {
      const newPosition = status.currentTime + (seconds * 1000);
      player.seekTo(Math.max(0, Math.min(newPosition, status.duration)));
    }
  };

  const handleTouch = (locationX: number) => {
    if (progressBarWidth.current > 0 && status.duration > 0) {
      const seekRatio = Math.max(0, Math.min(locationX / progressBarWidth.current, 1));
      const seekTime = seekRatio * status.duration;
      player.seekTo(seekTime);
    }
  };

  // Fungsi pemformat waktu yang lebih akurat
  const formatTime = (ms: number | undefined) => {
    if (ms === undefined || ms <= 0) return '0:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Hitung persentase progress
  const progress = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Volume2 size={16} color="#10B981" />
        <Text style={styles.title}>{title || 'Audio Setoran'}</Text>
      </View>
      
      <View style={styles.controls}>
        <Pressable style={styles.secondaryButton} onPress={() => skip(-10)}>
          <ChevronLeft size={18} color="#6B7280" />
        </Pressable>

        <Pressable style={styles.playButton} onPress={playPause}>
          {status.isBuffering ? (
             <Text style={styles.loadingText}>...</Text>
          ) : player.playing ? (
            <Pause size={24} color="white" />
          ) : (
            <Play size={24} color="white" fill="white" />
          )}
        </Pressable>

        <Pressable style={styles.secondaryButton} onPress={() => skip(10)}>
          <ChevronRight size={18} color="#6B7280" />
        </Pressable>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            {/* Jika status.duration masih 0, berarti metadata sedang dimuat.
               Kita tampilkan formatTime(0) agar tetap 0:00 sampai data masuk.
            */}
            {formatTime(status.currentTime)} / {status.duration > 0 ? formatTime(status.duration) : '0:00'}
          </Text>
        </View>
      </View>

      <View 
        style={styles.seekArea}
        onLayout={(e) => (progressBarWidth.current = e.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(e) => handleTouch(e.nativeEvent.locationX)}
        onResponderMove={(e) => handleTouch(e.nativeEvent.locationX)}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
          <View style={[styles.progressKnob, { left: `${progress}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '700',
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  secondaryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  loadingText: { color: 'white', fontWeight: 'bold' },
  timeContainer: { flex: 1, alignItems: 'flex-end' },
  timeText: { fontSize: 11, color: '#374151', fontFamily: 'monospace', fontWeight: '600' },
  
  seekArea: {
    height: 30,
    justifyContent: 'center',
    marginTop: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressKnob: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#059669',
    top: -4,
    marginLeft: -7,
  },
});