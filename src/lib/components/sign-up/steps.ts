import { ICONS } from '$lib/components/system/icons/types';

const stepDescription = {
  name: 'description',
  type: 'questions-list',
  question: 'Which best describes you?',
  answers: [
    {
      icon: ICONS.BOOK,
      text: 'Signing Naturally Student',
      value: 'student'
    },
    {
      icon: ICONS.PERSON_RAISED_HAND,
      text: 'ASL App Learner',
      value: 'app-learner'
    },
    {
      icon: ICONS.LEAF,
      text: 'New to ASL',
      value: 'new'
    }
  ]
};

const stepUnits = {
  name: 'units',
  type: 'questions-square',
  question: 'Which “Signing Naturally” unit are you currently studying at college/university?',
  answers: [
    {
      text: 'Unit 1-6',
      value: 'unit-1-6',
      unlockLevels: 100
    },
    {
      text: 'Unit 7-12',
      value: 'unit-7-12',
      unlockLevels: 200
    },
    {
      text: 'Unit 13-17',
      value: 'unit-13-17',
      unlockLevels: 300
    },
    {
      text: 'Unit 18-25',
      value: 'unit-18-25',
      unlockLevels: 400
    }
  ]
};

const stepPractice = {
  name: 'practice',
  type: 'questions-square',
  question: 'Do you practice ASL outside class for school, personal use, or real-life experience?',
  answers: [
    {
      text: 'Yes',
      value: 'yes'
    },
    {
      text: 'No',
      value: 'no'
    }
  ]
};

const stepPlatform = {
  name: 'platforms',
  type: 'questions-list',
  question: 'What platform are you using to learn ASL?',
  answers: [
    {
      text: 'Lingvano',
      value: 'lingvano'
    },
    {
      text: 'ASL Bloom',
      value: 'asl-bloom'
    },
    {
      text: 'The ASL APP',
      value: 'asl-app'
    },
    {
      text: 'Other',
      value: 'other'
    },
    {
      text: 'I’m not using any platform',
      value: 'none'
    }
  ]
};

export { stepDescription, stepUnits, stepPractice, stepPlatform };

export const sequences = {
  student: ['units', 'signup'],
  'app-learner': ['platforms', 'signup'],
  new: ['signup']
};
