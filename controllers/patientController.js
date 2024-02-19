const Patient = require('../models/patientModel.js');
const User = require('../models/userModel.js');

async function tambahPatient(req, res) {
  let { nama, umur, jenisPenyakit, catatan, kode, alamatRumah, alamatTujuan } = req.body;
  if (!nama || !umur || !jenisPenyakit || !catatan || !kode || !alamatRumah || !alamatTujuan) {
    return res.status(400).json({
      status: 400,
      success: false,
      error: 'Each column must be filled in'
    });
  }

  try {
    if (typeof alamatRumah === 'string') alamatRumah = JSON.parse(alamatRumah);
    if (typeof alamatTujuan === 'string') alamatTujuan = JSON.parse(alamatTujuan);
    alamatRumah = {
      name: alamatRumah.name,
      longi: alamatRumah.longitude || alamatRumah.longi,
      lat: alamatRumah.latitude || alamatRumah.lat
    };

    alamatTujuan = {
      name: alamatTujuan.name,
      longi: alamatTujuan.longitude || alamatTujuan.longi,
      lat: alamatTujuan.latitude || alamatTujuan.lat
    };
    const existingKode = await Patient.findOne({ kode });
    if (existingKode) {
      return res.status(400).json({
        status: 400,
        success: false,
        error: 'Kode already used in another device'
      });
    }
    const user = await User.findById(req.user.userId);
    if (user.patients.length >= 1) {
      return res.status(400).json({
        status: 400,
        success: false,
        error: 'You already have a patient. Cannot add more than one patient.'
      });
    }
    const dataPatient = await Patient.create({
      nama,
      umur,
      jenisPenyakit,
      catatan,
      kode,
      alamatRumah,
      alamatTujuan,
      createdBy: req.user.userId
    });
    // const user = await User.findByIdAndUpdate(
    //   req.user.userId,
    //   { $push: { patients: dataPatient._id } },
    //   { new: true }
    // );
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { patients: [dataPatient._id] } },
    );


    res.status(200).json({
      status: 200,
      success: true,
      message: 'Patient data saved successfully', 
      data: dataPatient,
      user : {nama: updatedUser.nama, email: updatedUser.email}
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: 500,
      success: false,
      error: "An error occurred while saving patient data"
    });
  }
}

async function getPatient(req, res) {
  const { id } = req.params; 

  try {
    const dataPatient = await Patient.findById(id);

    if (!dataPatient) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'Patient data not found'
      });
    }
    if (dataPatient.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'You do not have permission to access this patient data'
      });
    }
    res.status(200).json({
      status: 200,
      success: true,
      message: 'Successfully get data patient',
      data: dataPatient
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: 'An error occurred while retrieving patient data'
    });
  }
}

// async function updatePatient(req, res){
//   const { id } = req.params;
//   let { nama, umur, jenisPenyakit, catatan, kode, alamatRumah, alamatTujuan} = req.body;
//   try {
//     const existingPatient = await Patient.findById(id);
//     if (!existingPatient) {
//       return res.status(404).json({
//         status: 404,
//         success: false,
//         error: 'Patient data not found'
//       });
//     }

//     if (existingPatient.createdBy.toString() !== req.user.userId) {
//       return res.status(403).json({
//         status: 403,
//         success: false,
//         error: 'You do not have permission to update this patient data'
//       });
//     }
//     if (typeof alamatRumah === 'string') {
//       let parsedAlamatRumah = JSON.parse(alamatRumah);
//       alamatRumah = {
//         name: parsedAlamatRumah.name,
//         longi: parsedAlamatRumah.longitude,
//         lat: parsedAlamatRumah.latitude
//       };
//     }
    
//     if (typeof alamatTujuan === 'string') {
//       let parsedAlamatTujuan = JSON.parse(alamatTujuan);
//       alamatTujuan = {
//         name: parsedAlamatTujuan.name,
//         longi: parsedAlamatTujuan.longitude,
//         lat: parsedAlamatTujuan.latitude
//       };
//     }
    
//     const updatedPatient = await Patient.findByIdAndUpdate(id, {
//       nama,
//       umur,
//       jenisPenyakit,
//       catatan,
//       kode,
//       alamatRumah,
//       alamatTujuan,
//     }, { new: true });

//     if (!updatedPatient) {
//       return res.status(404).json({
//         status: 404,
//         success: false,
//         error: 'Patient data not found'
//       });
//     }

//     res.json({
//       status: 200,
//       success: true,
//       message: 'Patient data is updated successfully',
//       data: updatedPatient
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 500,
//       success: false,
//       error: 'An error occurred while updating patient data'
//     });
//   }
// }
async function updatePatient(req, res){
  const { id } = req.params;

  // Data hard-coded untuk tes
  const testData = {
    nama: "Nama Tes",
    umur: 30,
    jenisPenyakit: "Tes Penyakit",
    catatan: "Ini adalah catatan tes",
    kode: "Kode123",
    alamatRumah: {
      name: "Rumah Tes",
      longi: 112.780,
      lat: -7.280
    },
    alamatTujuan: {
      name: "Supermarket Tes",
      longi: 112.790,
      lat: -7.290
    }
  };

  try {
    const existingPatient = await Patient.findById(id);
    if (!existingPatient) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'Patient data not found'
      });
    }

    if (existingPatient.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        success: false,
        error: 'You do not have permission to update this patient data'
      });
    }
    
    const updatedPatient = await Patient.findByIdAndUpdate(id, testData, { new: true });

    if (!updatedPatient) {
      return res.status(404).json({
        status: 404,
        success: false,
        error: 'Patient data not found'
      });
    }

    res.json({
      status: 200,
      success: true,
      message: 'Patient data is updated successfully',
      data: updatedPatient
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      success: false,
      error: 'An error occurred while updating patient data'
    });
  }
}


async function getPatientByKode(kode) {
  return await Patient.findOne({ kode: kode });
}

module.exports = {
  tambahPatient,
  getPatient,
  updatePatient,
  getPatientByKode
};