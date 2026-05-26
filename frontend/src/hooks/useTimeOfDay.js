import { useEffect, useState } from 'react'

export function useTimeOfDay() {
  const [period, setPeriod] = useState(getPeriod())

  useEffect(() => {
    const id = setInterval(() => setPeriod(getPeriod()), 60000)
    return () => clearInterval(id)
  }, [])

  return period
}

function getPeriod() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) {
    return {
      key: 'morning',
      title: 'Plan your day',
      subtitle: 'Set intentions and prioritize what matters',
      accent: 'blue',
    }
  }
  if (hour >= 12 && hour < 17) {
    return {
      key: 'afternoon',
      title: 'Focus mode',
      subtitle: 'Deep work window — pick your next move',
      accent: 'purple',
    }
  }
  return {
    key: 'night',
    title: 'Review + carry forward',
    subtitle: 'Wrap up today and prep for tomorrow',
    accent: 'blue',
  }
}
