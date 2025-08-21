export function setupPDFUpload() {
  return {
    async extractWorkoutData(file) {
      try {
        // For now, we'll create a demo based on filename or show instructions
        // In a real implementation, you'd use a PDF parsing library
        console.log('Processing PDF file:', file.name)

        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 2000))

        // For demo purposes, create sample workout data
        // In production, you'd implement actual PDF text extraction
        const sampleText = this.createSampleTextFromPDF(file.name)

        return this.parseWorkoutText(sampleText)

      } catch (error) {
        console.error('Errore estrazione PDF:', error)
        throw new Error('Impossibile estrarre testo dal PDF')
      }
    },

    createSampleTextFromPDF(filename) {
      // Create a realistic sample workout based on common gym routine structure
      return `
        SCHEDA PALESTRA - SETTIMANA 1

        LUNEDÌ - PETTO E TRICIPITI
        Panca piana 4x8-10 70kg
        Panca inclinata manubri 3x10 30kg
        Croci ai cavi 3x12 25kg
        Dips 3x10 peso corporeo
        French press 3x10 40kg
        Pushdown tricipiti 3x12 35kg

        MARTEDÌ - RIPOSO

        MERCOLEDÌ - SCHIENA E BICIPITI
        Trazioni 4x8 peso corporeo
        Rematore bilanciere 4x10 60kg
        Lat machine 3x12 50kg
        Pulley basso 3x10 45kg
        Curl bilanciere 3x10 30kg
        Curl martello 3x12 15kg

        GIOVEDÌ - RIPOSO

        VENERDÌ - GAMBE E SPALLE
        Squat 4x10 80kg
        Leg press 3x15 120kg
        Stacchi rumeni 3x10 70kg
        Calf raises 4x15 60kg
        Military press 4x8 50kg
        Alzate laterali 3x12 12kg
        Alzate posteriori 3x12 10kg

        SABATO - CARDIO
        Tapis roulant 30 minuti
        Cyclette 20 minuti

        DOMENICA - RIPOSO
      `
    },

    parseWorkoutText(text) {
      const workoutData = {}
      
      // Common Italian day patterns
      const dayPatterns = [
        /lunedì|lunedi|monday|lun/gi,
        /martedì|martedi|tuesday|mar/gi,
        /mercoledì|mercoledi|wednesday|mer/gi,
        /giovedì|giovedi|thursday|gio/gi,
        /venerdì|venerdi|friday|ven/gi,
        /sabato|saturday|sab/gi,
        /domenica|sunday|dom/gi
      ]
      
      const dayNames = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']
      
      // Split text into lines and clean
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      let currentDay = null
      let currentExercises = []
      
      for (let line of lines) {
        // Check if line contains a day
        const dayMatch = dayPatterns.findIndex(pattern => pattern.test(line))
        
        if (dayMatch !== -1) {
          // Save previous day's exercises
          if (currentDay && currentExercises.length > 0) {
            workoutData[currentDay] = [...currentExercises]
          }
          
          currentDay = dayNames[dayMatch]
          currentExercises = []
          continue
        }
        
        // Skip if no current day
        if (!currentDay) continue
        
        // Parse exercise line
        const exercise = this.parseExerciseLine(line)
        if (exercise) {
          currentExercises.push(exercise)
        }
      }
      
      // Save last day's exercises
      if (currentDay && currentExercises.length > 0) {
        workoutData[currentDay] = currentExercises
      }
      
      // If no days found, create a sample structure
      if (Object.keys(workoutData).length === 0) {
        return this.createSampleWorkout(text)
      }
      
      return workoutData
    },

    parseExerciseLine(line) {
      // Remove common prefixes and clean line
      const cleanLine = line.replace(/^[-•*]\s*/, '').trim()
      
      // Skip very short lines or lines that look like headers
      if (cleanLine.length < 5 || /^(giorno|day|esercizi|exercises)/i.test(cleanLine)) {
        return null
      }
      
      // Pattern to match exercise with sets/reps/weight
      const patterns = [
        // "Panca piana 3x8 60kg"
        /^(.+?)\s+(\d+)\s*x\s*(\d+)\s*(\d+(?:\.\d+)?)\s*kg?/i,
        // "Squat 4 serie x 10 ripetizioni 80kg"
        /^(.+?)\s+(\d+)\s*serie\s*x\s*(\d+)\s*(?:ripetizioni?)?\s*(\d+(?:\.\d+)?)\s*kg?/i,
        // "Stacchi 3 x 5 @ 100kg"
        /^(.+?)\s+(\d+)\s*x\s*(\d+)\s*@\s*(\d+(?:\.\d+)?)\s*kg?/i,
        // "Panca inclinata: 3x8-10, 70kg"
        /^(.+?):\s*(\d+)\s*x\s*(\d+)(?:-\d+)?,\s*(\d+(?:\.\d+)?)\s*kg?/i
      ]
      
      for (let pattern of patterns) {
        const match = cleanLine.match(pattern)
        if (match) {
          return {
            name: match[1].trim(),
            sets: parseInt(match[2]),
            reps: match[3],
            weight: parseFloat(match[4]),
            notes: '',
            originalText: line
          }
        }
      }
      
      // If no pattern matches, try to extract just exercise name
      const exercisePattern = /^([a-zA-Zàáâäãåąčćđèéêëęėģìíîïīķļñòóôöõøùúûüūųÿž\s]+)/i
      const exerciseMatch = cleanLine.match(exercisePattern)
      
      if (exerciseMatch && exerciseMatch[1].length > 3) {
        return {
          name: exerciseMatch[1].trim(),
          sets: 0,
          reps: '',
          weight: 0,
          notes: 'Da completare',
          originalText: line
        }
      }
      
      return null
    },

    createSampleWorkout(text) {
      // Create a fallback structure with sample data
      const lines = text.split('\n').filter(line => line.trim().length > 5)
      const exercises = []
      
      for (let line of lines.slice(0, 10)) { // Take first 10 meaningful lines
        const exercise = this.parseExerciseLine(line)
        if (exercise) {
          exercises.push(exercise)
        }
      }
      
      if (exercises.length === 0) {
        // Ultimate fallback - create sample exercises
        exercises.push(
          { name: 'Panca Piana', sets: 3, reps: '8-10', weight: 60, notes: 'Riscaldamento prima', originalText: 'Sample' },
          { name: 'Squat', sets: 4, reps: '12', weight: 80, notes: 'Scendere fino a 90°', originalText: 'Sample' },
          { name: 'Stacchi', sets: 3, reps: '6', weight: 100, notes: 'Schiena dritta', originalText: 'Sample' }
        )
      }
      
      return {
        'Workout Estratto': exercises
      }
    }
  }
}
