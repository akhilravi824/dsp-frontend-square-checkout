import { apiFetch } from './client';

const progressDataDummy = {
  levels: {
    '1': {
      units: {
        '1': {
          lessons: {
            yes: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            respect: {
              completed: true,
              attempts: 3,
              timeSpent: 60
            },
            come: {
              completed: true,
              attempts: 3,
              timeSpent: 60
            },
            pregnant: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            yourself: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            please: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            girlfriend: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            nice: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            boyfriend: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            laundry: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            past: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            hypothesis: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            spill: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            }
          }
        },
        '2': {
          lessons: {
            still: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            lobster: {
              completed: true,
              attempts: 3,
              timeSpent: 60
            },
            always: {
              completed: true,
              attempts: 3,
              timeSpent: 60
            },
            to: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            process: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            },
            long: {
              completed: true,
              attempts: 1,
              timeSpent: 60
            }
          }
        },
        '3': {
          lessons: {
            catch: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            dropevent: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            make: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            }
          }
        },
        '4': {
          lessons: {
            road: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            france: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            egypt: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            scarf: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            juice: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            },
            zipverb: {
              completed: true,
              attempts: 1,
              timeSpent: 10
            }
          }
        }
      },
      locked: false
    },
    '2': {
      units: {
        '1': { lessons: {} },
        '2': { lessons: {} },
        '3': { lessons: {} },
        '4': { lessons: {} }
      },
      locked: true
    }
  },
  freeTries: 3,
  activeDays: [],
  totalAttempts: 0,
  totalTimeSpent: 0
};

export const progressApi = {
  getProgress: () =>
    apiFetch('/progress', {
      method: 'GET'
    }),

  updateProgress: (obj: any) =>
    apiFetch('/progress/update', {
      method: 'POST',
      body: JSON.stringify(obj)
    }),

  uploadVideo: (blob: Blob, useProxy: boolean = false) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log('Dummy video upload completed');
        const success = true; // Simulate success
        resolve({ success });
      }, 5000);

      /*
      // WIP
      // Uncomment the following code to enable actual video upload functionality

      const endpoint = useProxy ? '/api/videos/proxy-upload' : '/api/videos/upload';
      const formData = new FormData();

      let fileExtension = 'webm';
      if (blob.type.includes('mp4')) {
        fileExtension = 'mp4';
      } else if (blob.type.includes('quicktime') || blob.type.includes('mov')) {
        fileExtension = 'mov';
      }

      formData.append('video', blob, `recorded_video.${fileExtension}`);

      apiFetch(endpoint, {
        method: 'POST',
        body: formData
      })
        .then((response) => {
          console.log('Video upload successful:', response);
          resolve({ success: true, data: response });
        })
        .catch((error) => {
          console.error('Video upload failed:', error);
          resolve({ success: false, error: error.message || 'Upload failed' });
          // Alternatively, use reject(error) if you want to throw an exception
          // reject(error);
        });
        */
    });
  }
};
