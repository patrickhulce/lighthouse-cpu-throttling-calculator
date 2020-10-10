import React, {useState} from 'react'
import Head from 'next/head'
import styles from '../styles/Home.module.css'

/**
 * Returns the multipliers and error messages for the BenchmarkIndex.
 * @see https://docs.google.com/spreadsheets/d/1E0gZwKsxegudkjJl8Fki_sOwHKpqgXwt8aBAfuUaB8A/edit#gid=0
 */
function computeMultiplierMessages(benchmarkIndex) {
  if (!Number.isFinite(benchmarkIndex)) return undefined
  if (benchmarkIndex >= 1300) {
    // 2000 = 6x slowdown
    // 1766 = 5x slowdown
    // 1533 = 4x slowdown
    // 1300 = 3x slowdown
    const excess = (benchmarkIndex - 1300) / 233
    const multiplier = 3 + excess
    const confidenceRange = Math.min(Math.max(excess, 1.5, multiplier * 0.3))
    const lowerBound = multiplier - confidenceRange / 2
    const upperBound = multiplier + confidenceRange / 2
    return {multiplier, range: [lowerBound, upperBound]}
  } else if (benchmarkIndex >= 800) {
    // 1300 = 3x slowdown
    // 800 = 2x slowdown
    const excess = (benchmarkIndex - 800) / 500
    const multiplier = 2 + excess
    const confidenceRange = 1.5
    const lowerBound = multiplier - confidenceRange / 2
    const upperBound = multiplier + confidenceRange / 2
    return {multiplier, range: [lowerBound, upperBound]}
  } else if (benchmarkIndex >= 150) {
    // 800 = 2x slowdown
    // 150 = 1x
    const excess = (benchmarkIndex - 150) / 650
    const multiplier = 1 + excess
    const confidenceRange = 0.5
    const lowerBound = multiplier - confidenceRange / 2
    const upperBound = multiplier + confidenceRange / 2
    return {multiplier, range: [lowerBound, upperBound]}
  } else {
    return {message: 'This device is too slow to accurately emulate the target Lighthouse device.'}
  }
}

function MultiplierPredictor(props) {
  const multiplierMessages = computeMultiplierMessages(props.benchmarkIndex)
  if (!multiplierMessages) return <div className={styles.message}></div>

  if (multiplierMessages.message) {
    return (
      <div className={styles.message}>
        <div className={styles.warning}>Warning</div>
        {multiplierMessages.message}
      </div>
    )
  }

  return (
    <div className={styles.message}>
      <div
        className={styles.multiplier}
        data-tooltip="The best estimate of the cpuSlowdownMultiplier this device should use."
      >
        {multiplierMessages.multiplier.toFixed(1)}x
      </div>
      <div
        className={styles.multiplierRange}
        data-tooltip="The range of the cpuSlowdownMultiplier that this device might actually need."
      >
        {multiplierMessages.range[0].toFixed(1)}x - {multiplierMessages.range[1].toFixed(1)}x
      </div>
      <code className={styles.code}>
        lighthouse --throttling.cpuSlowdownMultiplier={multiplierMessages.multiplier.toFixed(1)}{' '}
        {'<url>'}
      </code>
    </div>
  )
}

export default function Home() {
  const [benchmarkIndex, setIndex] = useState(undefined)
  return (
    <div className={styles.container}>
      <Head>
        <title>Lighthouse CPU Throttling Calculator</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          <img src="/favicon.svg" style={{height: '10vh', maxHeight: 60}} /> CPU Throttling
          Calculator
        </h1>

        <p className={styles.description}>
          Enter your <code className={styles.code}>BenchmarkIndex</code>
        </p>

        <input
          type="text"
          className={styles.benchmarkInput}
          value={benchmarkIndex}
          onChange={e => setIndex(Number(e.target.value) || undefined)}
        ></input>

        <MultiplierPredictor benchmarkIndex={benchmarkIndex} />

        <div className={styles.grid}>
          <a
            href="https://github.com/GoogleChrome/lighthouse/blob/master/docs/throttling.md#cpu-throttling"
            className={styles.card}
          >
            <h3>Throttling &rarr;</h3>
            <p>Read about CPU throttling in Lighthouse and how to calibrate.</p>
          </a>

          <a
            href="https://github.com/GoogleChrome/lighthouse/blob/master/docs/variability.md"
            className={styles.card}
          >
            <h3>Variability &rarr;</h3>
            <p>Find in-depth information about variance in Lighthouse scores.</p>
          </a>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://github.com/GoogleChrome/lighthouse"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by <img src="/favicon.svg" width={30} height={30} />
        </a>
      </footer>
    </div>
  )
}
