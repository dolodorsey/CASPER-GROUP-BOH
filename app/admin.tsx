import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { COLORS } from '@/constants/colors';

export default function SupabaseTest() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testSupabaseConnection();
  }, []);

  async function testSupabaseConnection() {
    try {
      setLoading(true);
      setError(null);
      
      const { data: alerts, error: queryError } = await supabase
        .from('alerts')
        .select('*')
        .limit(10);

      if (queryError) {
        throw queryError;
      }

      setData(alerts);
    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setError(err.message || 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Supabase Connection Test</Text>
        <Text style={styles.subtitle}>Testing query to alerts table</Text>
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.moltenGold} />
          <Text style={styles.loadingText}>Connecting to Supabase...</Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>❌ Connection Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {!loading && !error && data && (
        <ScrollView style={styles.content}>
          <View style={styles.successContainer}>
            <Text style={styles.successTitle}>✅ Connection Successful!</Text>
            <Text style={styles.successText}>
              Found {data.length} record{data.length !== 1 ? 's' : ''} in alerts table
            </Text>
          </View>

          <View style={styles.dataContainer}>
            <Text style={styles.dataTitle}>Query Results:</Text>
            <View style={styles.jsonContainer}>
              <Text style={styles.jsonText}>
                {JSON.stringify(data, null, 2)}
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.deepBlack,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderGray,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.pureWhite,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.lightGray,
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.alertRed,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.alertRed,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.lightGray,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  successContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.emeraldGreen,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.emeraldGreen,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: COLORS.lightGray,
  },
  dataContainer: {
    margin: 20,
    marginTop: 0,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.pureWhite,
    marginBottom: 12,
  },
  jsonContainer: {
    backgroundColor: COLORS.darkCharcoal,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  jsonText: {
    fontSize: 12,
    color: COLORS.platinum,
    fontFamily: 'monospace',
  },
});