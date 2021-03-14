$(() => {
  const meetingsList = '#meetings_list'
  if (!$(meetingsList).length) return

  const bbb = new Bbb(meetingsList)
  bbb.loadMeetings()

  const BbbHandlers = (bbb) => {
    const $newMeetingForm = $('#new_meeting_form')

    $newMeetingForm
      .on('submit', function (e) {
        e.preventDefault()
        const $this = $(this)
        bbb.createMeeting($this.serialize())
        $this.get(0).reset()
      })

    $(document)
      .on('click', '#meetings_list .delete', function (e) {
        e.preventDefault()
        const $this = $(this)
        const meetingID = $this.closest('.meeting').data('meetingid')
        const result = confirm('Want to delete?')
        if (result) {
          bbb.endMeeting(meetingID)
        }
      })
      .on('click', '#meetings_list .joinA', function (e) {
        e.preventDefault()
        const $this = $(this)
        const meetingID = $this.closest('.meeting').data('meetingid')
        bbb.joinMeeting(meetingID)
      })
      .on('click', '#meetings_list .joinM', function (e) {
        e.preventDefault()
        const $this = $(this)
        const meetingID = $this.closest('.meeting').data('meetingid')
        bbb.joinMeeting(meetingID, true)
      })
  }

  BbbHandlers(bbb)
})
