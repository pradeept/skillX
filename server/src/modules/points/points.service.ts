// credit points to a user
// create a transaction record in point_transaction

/*
    - for completing a session as a teacher
    - for adding a review
    - (future) buying points
*/

const creditPoints = async (
  userId: string,
  points: number,
  reason: string
) => {
    
};

// debit points from a user
// create a transaction record in point_transaction

/*
    - for cancelling a scheduled session
    - for completing a session as a learner
    - for no_show for a session
    - on session creation (to avoid below problem)
*/

// refund
/*
(optional -  if points deduct after completion of a session,
    but this will create a situation where
    user can create multiple sessions before getting completed..
)
    - when somebody creates a session and 
    cancels it before the provider accepts it
*/
