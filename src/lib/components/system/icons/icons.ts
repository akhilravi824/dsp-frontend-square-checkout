import type { IconType } from './types';
import arrowBackSvg from './svg/arrow_back.svg?raw';
import arrowDownwardSvg from './svg/arrow_downward.svg?raw';
import arrowForwardSvg from './svg/arrow_forward.svg?raw';
import arrowUpwardSvg from './svg/arrow_upward.svg?raw';
import bookSvg from './svg/Book.svg?raw';
import careerSvg from './svg/Career.svg?raw';
import checkSvg from './svg/check.svg?raw';
import closeSvg from './svg/close.svg?raw';
import closeBarSvg from './svg/close_bar.svg?raw';
import collapseSvg from './svg/collapse.svg?raw';
import countdownSvg from './svg/countdown.svg?raw';
import creditCardSvg from './svg/credit_card.svg?raw';
import deleteSvg from './svg/delete.svg?raw';
import dockToRightSvg from './svg/dock_to_right.svg?raw';
import dropdownSvg from './svg/Dropdown.svg?raw';
import emailSvg from './svg/Email.svg?raw';
import errorSVG from './svg/error.svg?raw';
import eventSvg from './svg/event.svg?raw';
import expandSvg from './svg/expand.svg?raw';
import experience1Svg from './svg/Experience-1.svg?raw';
import experience2Svg from './svg/Experience-2.svg?raw';
import experience3Svg from './svg/Experience-3.svg?raw';
import experience4Svg from './svg/Experience-4.svg?raw';
import familySvg from './svg/Family.svg?raw';
import fastForwardSvg from './svg/fast_forward.svg?raw';
import globeBookSvg from './svg/globe_book.svg?raw';
import googleSvg from './svg/Google.svg?raw';
import gridGuidesSvg from './svg/grid_guides.svg?raw';
import gridViewSvg from './svg/grid_view.svg?raw';
import handSvg from './svg/Hand.svg?raw';
import hideInputSvg from './svg/Hide input.svg?raw';
import idCardSvg from './svg/ID Card.svg?raw';
import instructionsSvg from './svg/instructions.svg?raw';
import leafSvg from './svg/Leaf.svg?raw';
import lockSvg from './svg/lock.svg?raw';
import passwordSvg from './svg/Password.svg?raw';
import pauseSvg from './svg/pause.svg?raw';
import personAddSvg from './svg/person_add.svg?raw';
import personSvg from './svg/Person.svg?raw';
import personRaisedHandSvg from './svg/Person-raised-hand.svg?raw';
import playSvg from './svg/play_arrow.svg?raw';
import playArrowSvg from './svg/play_arrow.svg?raw';
import plusSvg from './svg/plus.svg?raw';
import priorityHighSvg from './svg/priority_high.svg?raw';
import profileSvg from './svg/Profile.svg?raw';
import progress1Svg from './svg/Progress-1.svg?raw';
import progress2Svg from './svg/Progress-2.svg?raw';
import progress3Svg from './svg/Progress-3.svg?raw';
import progress4Svg from './svg/Progress-4.svg?raw';
import quizSvg from './svg/Quiz.svg?raw';
import recordSvg from './svg/record.svg?raw';
import retrySvg from './svg/retry.svg?raw';
import securitySvg from './svg/security.svg?raw';
import settingsSvg from './svg/settings.svg?raw';
import showInputSvg from './svg/Show input.svg?raw';
import starCircleSvg from './svg/star-circle.svg?raw';
import statsSvg from './svg/stats.svg?raw';
import stopSvg from './svg/stop.svg?raw';
import subtitlesOffSvg from './svg/subtitles_off.svg?raw';
import subtitlesOnSvg from './svg/subtitles_on.svg?raw';
import trophySvg from './svg/Trophy.svg?raw';
import universitySvg from './svg/University.svg?raw';
import volumeOffSvg from './svg/volume_off.svg?raw';
import volumeOnSvg from './svg/volume_on.svg?raw';
import newReleaseSvg from './svg/new_releases.svg?raw';
import diagramSvg from './svg/diagram.svg?raw';
import fiveHundredPlusSvg from './svg/500_plus.svg?raw';
import XSvg from './svg/x.svg?raw';
import ThreadSvg from './svg/thread.svg?raw';
import InstagramSvg from './svg/Instagram.svg?raw';
import FacebookSvg from './svg/facebook.svg?raw';
import LinkedInSvg from './svg/linkedin.svg?raw';

// Custom hand gesture image - single image with CSS flip for left hand
// Supports SVG, PNG, or JPG formats
const handImage = `/images/hand-icons/hand-gesture-new.png`;

export const svgs: Partial<Record<IconType, string>> = {
  arrow_back: arrowBackSvg,
  arrow_downward: arrowDownwardSvg,
  arrow_forward: arrowForwardSvg,
  arrow_upward: arrowUpwardSvg,
  book: bookSvg,
  career: careerSvg,
  check: checkSvg,
  close: closeSvg,
  close_bar: closeBarSvg,
  collapse: collapseSvg,
  countdown: countdownSvg,
  credit_card: creditCardSvg,
  delete: deleteSvg,
  dock_to_right: dockToRightSvg,
  dropdown: dropdownSvg,
  email: emailSvg,
  error: errorSVG,
  event: eventSvg,
  expand: expandSvg,
  'experience-1': experience1Svg,
  'experience-2': experience2Svg,
  'experience-3': experience3Svg,
  'experience-4': experience4Svg,
  facebook: FacebookSvg,
  family: familySvg,
  fast_forward: fastForwardSvg,
  globe_book: globeBookSvg,
  google: googleSvg,
  grid_guides: gridGuidesSvg,
  grid_view: gridViewSvg,
  hand: handSvg,
  hide_input: hideInputSvg,
  id_card: idCardSvg,
  instructions: instructionsSvg,
  leaf: leafSvg,
  linkedin: LinkedInSvg,
  lock: lockSvg,
  password: passwordSvg,
  pause: pauseSvg,
  person: personSvg,
  personAdd: personAddSvg,
  'person-raised-hand': personRaisedHandSvg,
  play: playSvg,
  play_arrow: playArrowSvg,
  plus: plusSvg,
  priority_high: priorityHighSvg,
  profile: profileSvg,
  'progress-1': progress1Svg,
  'progress-2': progress2Svg,
  'progress-3': progress3Svg,
  'progress-4': progress4Svg,
  quiz: quizSvg,
  record: recordSvg,
  retry: retrySvg,
  security: securitySvg,
  settings: settingsSvg,
  show_input: showInputSvg,
  'star-circle': starCircleSvg,
  stats: statsSvg,
  stop: stopSvg,
  subtitles_off: subtitlesOffSvg,
  subtitles_on: subtitlesOnSvg,
  trophy: trophySvg,
  university: universitySvg,
  volume_off: volumeOffSvg,
  volume_on: volumeOnSvg,
  new_releases: newReleaseSvg,
  diagram: diagramSvg,
  '500_plus': fiveHundredPlusSvg,
  x: XSvg,
  thread: ThreadSvg,
  instagram: InstagramSvg,
  HAND_LEFT: handImage,
  HAND_RIGHT: handImage
};
