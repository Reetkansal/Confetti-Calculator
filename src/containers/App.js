import React, { useState, useEffect } from 'react'
import App from '../components/app/App'
import keypads from '../constants/keypads'
import { camelCase } from 'lodash'
import Decimal from '../utils/decimal-custom'
import ConfettiExplosion from 'react-confetti-explosion'
const AppContainer = () => {
  const [state, setState] = useState({
    displayValue: '0',
    currentOutput: null,
    currentOperation: null,
    resetDisplayValueOnNextKeyPress: true,
    mode: 'scientific',
    trigUnit: 'deg',
    memory: null,
  })
  const [isExploding, setIsExploding] = useState(false) // confetti state

  const handleNumberKey = (key) => {
    const { displayValue: prevDisplayValue, resetDisplayValueOnNextKeyPress } =
      state
    const number = key.textContent
    let displayValue = resetDisplayValueOnNextKeyPress ? '' : prevDisplayValue

    if (key.id === 'decimal' && !displayValue.includes('.')) {
      displayValue = displayValue ? displayValue + '.' : '0.'
    } else if (key.id !== 'decimal') {
      displayValue += number
    }

    setState({
      ...state,
      displayValue: displayValue.replace(/^0+(?!\.)/, ''),
      resetDisplayValueOnNextKeyPress: false,
    })
  }

  const handleConstantKey = ({ id: constant }) => {
    setState({
      ...state,
      displayValue: Decimal[constant].toString(),
      resetDisplayValueOnNextKeyPress: true,
    })
  }

  const handleBinaryOperationKey = (key) => {
    const { currentOperation, currentOutput, displayValue } = state
    const operation = key.id

    if (currentOperation) {
      handleEqualsKey()
    }

    setState((prevState) => ({
      ...prevState,
      currentOperation: operation,
      currentOutput: prevState.displayValue,
      resetDisplayValueOnNextKeyPress: true,
    }))
  }

  const handleUnaryOperationKey = (key) => {
    const { displayValue, trigUnit } = state
    const operation = key.id
    let operand = new Decimal(displayValue)

    if (/^(sin|cos|tan)$/.test(operation) && trigUnit === 'deg') {
      const PI = Decimal.acos(-1)
      operand = operand.times(new Decimal(PI).dividedBy(180))
    }

    let output = operand[operation]()

    setState({
      ...state,
      displayValue: output.toString(),
      resetDisplayValueOnNextKeyPress: true,
    })
  }

  const handleEqualsKey = () => {
    const { currentOperation, currentOutput, displayValue } = state

    if (!currentOperation) {
      return
    }

    const firstOperand = new Decimal(currentOutput)
    const secondOperand = displayValue
    let output = firstOperand[currentOperation](secondOperand)

    setState({
      ...state,
      currentOperation: null,
      currentOutput: output,
      displayValue: output.toString(),
      resetDisplayValueOnNextKeyPress: true,
    })
    if (
      (firstOperand == 5 && secondOperand == 6) ||
      (firstOperand == 6 && secondOperand == 5)
    ) {
      setIsExploding(true)
    }
  }

  const handleClearKey = () => {
    setState({
      ...state,
      currentOperation: null,
      currentOutput: null,
      displayValue: '0',
      resetDisplayValueOnNextKeyPress: true,
    })
  }

  const handleFunctionKey = ({ id: functionName }) => {
    switch (functionName) {
      case 'trigUnit':
        return setState((prevState) => ({
          ...prevState,
          trigUnit: prevState.trigUnit === 'deg' ? 'rad' : 'deg',
        }))

      case 'memoryAdd':
        return setState(({ memory, displayValue }) => ({
          ...state,
          memory: memory
            ? memory.plus(displayValue)
            : new Decimal(displayValue),
        }))

      case 'memorySubtract':
        return setState(({ memory, displayValue }) => ({
          ...state,
          memory: memory ? memory.minus(displayValue) : null,
        }))

      case 'memoryClear':
        return setState({ ...state, memory: null })

      case 'memoryRecall':
        return (
          state.memory &&
          setState(({ memory }) => ({
            ...state,
            displayValue: memory.toString(),
            resetDisplayValueOnNextKeyPress: true,
          }))
        )

      case 'random':
        return setState({
          ...state,
          displayValue: new Decimal(Math.random()).toString(),
          resetDisplayValueOnNextKeyPress: true,
        })

      default:
        return
    }
  }

  const handleClick = (event, { type }) => {
    const handlerName = camelCase(`handle-${type}-key`)
    const handler = {
      handleNumberKey,
      handleConstantKey,
      handleBinaryOperationKey,
      handleUnaryOperationKey,
      handleEqualsKey,
      handleClearKey,
      handleFunctionKey,
    }[handlerName]

    if (handler) {
      handler(event.currentTarget)
    }
  }

  return (
    <div className="pop-up">
      {
        //confetti explosion
        isExploding && (
          <ConfettiExplosion
            onComplete={() => setIsExploding(false)}
            particleCount={400}
            particleSize={18}
            zIndex={2}
            force={1}
            duration={3000}
          />
        )
      }
      <App
        keys={keypads[state.mode]}
        currentOperation={state.currentOperation}
        mode={state.mode}
        displayValue={state.displayValue}
        trigUnit={state.trigUnit}
        memory={state.memory}
        handleClick={handleClick}
      />
    </div>
  )
}

export default AppContainer
/*//moon 
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect fill="none" height="256" width="256" />
  <path d="M216.7,152.6A91.9,91.9,0,0,1,103.4,39.3h0A92,92,0,1,0,216.7,152.6Z" fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
  </svg>
// sun
<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <rect fill="none" height="256" width="256"/>
  <circle cx="128" cy="128" fill="none" r="60" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="128" x2="128" y1="36" y2="16"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="62.9" x2="48.8" y1="62.9" y2="48.8"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="36" x2="16" y1="128" y2="128"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="62.9" x2="48.8" y1="193.1" y2="207.2"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="128" x2="128" y1="220" y2="240"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="193.1" x2="207.2" y1="193.1" y2="207.2"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="220" x2="240" y1="128" y2="128"/>
  <line fill="none" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" x1="193.1" x2="207.2" y1="62.9" y2="48.8"/>
  </svg>*/
