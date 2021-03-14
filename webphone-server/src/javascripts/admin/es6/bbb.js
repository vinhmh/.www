class Bbb {
  constructor(meetingsList) {
    this.meetings = {};
    this.$meetingsList = $(meetingsList);
    this.loadMeetings = this.loadMeetings.bind(this);
    this.updateMeetingsDom = this.updateMeetingsDom.bind(this);
    this.endMeeting = this.endMeeting.bind(this);
  }

  loadMeetings() {
    this.getMeetings().then(this.updateMeetingsDom)
  }

  getMeetings() {
    return fetch('/bbb/getMeetings', {
      credentials: 'same-origin'
    })
      .then(res => res.text())
      .then(str => {
        let parser = new DOMParser();
        let result = parser.parseFromString(str, "text/xml");

        let meetings = result.getElementsByTagName('meeting');
        this.meetings = {};
        for (let m of meetings) {
          let meetingId = m.getElementsByTagName('meetingID')[0].textContent;
          let moderatorPW = m.getElementsByTagName('moderatorPW')[0].textContent;
          let attendeePW = m.getElementsByTagName('attendeePW')[0].textContent;
          this.meetings[meetingId] = { moderatorPW, attendeePW }
        }
      })
  };

  createMeeting(data) {
    return fetch('/bbb/create?' + data, {
      credentials: 'same-origin'
    }).then(this.loadMeetings);
  };

  endMeeting(meetingID) {
    let meeting = this.meetings[meetingID];
    let data = {
      meetingID: meetingID,
      password: meeting.moderatorPW
    };
    data = $.param(data);

    return fetch('/bbb/end?' + data, {
      credentials: 'same-origin'
    }).then(this.loadMeetings)
  };

  updateMeetingsDom() {
    this.$meetingsList.html('');
    let meetingRow;
    const meetings = Object.keys(CONF_MAP.meetings);
    for (let meetingID in this.meetings) {
      if (meetings.indexOf(meetingID) === -1) continue;

      meetingRow = this.getMeetingRow(meetingID);
      this.$meetingsList.append(meetingRow);
    }
  };

  getMeetingRow(meetingId) {
    let deleteBtn = '<a href="#" class="delete">Delete</a>';
    let joinA = '<a href="#" class="joinA">joinA</a>';
    let joinM = '<a href="#" class="joinM">joinM</a>';

    return '<tr class="meeting" data-meetingID="' + meetingId + '">' +
      '<td class="title"><p>' + meetingId + '</p></td>' +
      '<td>' + joinA + '</td>' +
      '<td>' + joinM + '</td>' +
      '<td>' + deleteBtn + '</td>' +
      '</tr>';
  };

  joinMeeting(meetingId, moderator = false) {
    let data = {
      fullName: 'ibridge_staff',
      meetingID: meetingId,
      password: this.meetings[meetingId].attendeePW
    };
    if (moderator) {
      data['password'] = this.meetings[meetingId].moderatorPW
    }
    data = $.param(data);
    let redirectWindow = window.open('', '_blank');

    fetch('/bbb/join?' + data, {
      credentials: 'same-origin'
    })
      .then(res => res.text())
      .then(url => {
        redirectWindow.location.href = url
      })
  }
}

window.Bbb = Bbb
