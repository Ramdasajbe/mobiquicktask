import React, { Component } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  LinearProgress,
  DialogTitle,
  DialogContent,
  TableBody,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
} from "@material-ui/core";
import { Pagination } from "@material-ui/lab";
import swal from "sweetalert";
import { withRouter } from "./utils";
const axios = require("axios");

class UploadFile extends Component {
  constructor() {
    super();
    this.state = {
      token: "",
      openProductModal: false,
      openProductEditModal: false,
      openProductDownloadModal: false,
      downloadLink: "",
      downloadUniqekey: "",
      id: "",
      name: "",
      uniqueykey: "",
      desc: "",
      price: "",
      discount: "",
      file: "",
      fileName: "",
      page: 1,
      search: "",
      products: [],
      pages: 0,
      loading: false,
    };
  }

  componentDidMount = () => {
    let token = localStorage.getItem("token");
    if (!token) {
      // this.props.history.push('/login');
      this.props.navigate("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getProduct();
      });
    }
  };

  getProduct = () => {
    this.setState({ loading: true });

    let data = "?";

    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios
      .get(`http://localhost:2000/get-product${data}`, {
        headers: {
          token: this.state.token,
        },
      })
      .then((res) => {
        this.setState({
          loading: false,
          products: res.data.products,
          pages: res.data.pages,
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.setState({ loading: false, products: [], pages: 0 }, () => {});
      });
  };

  deleteProduct = (id) => {
    axios
      .post(
        "http://localhost:2000/delete-product",
        {
          id: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            token: this.state.token,
          },
        }
      )
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
          type: "success",
        });

        this.setState({ page: 1 }, () => {
          this.pageChange(null, 1);
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
      });
  };

  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getProduct();
    });
  };

  logOut = () => {
    localStorage.setItem("token", null);
    // this.props.history.push('/');
    this.props.navigate("/");
  };

  onChange = (e) => {
    if (e.target.files && e.target.files[0] && e.target.files[0].name) {
      this.setState({ fileName: e.target.files[0].name }, () => {});
    }
    this.setState({ [e.target.name]: e.target.value }, () => {});
    if (e.target.name == "search") {
      this.setState({ page: 1 }, () => {
        this.getProduct();
      });
    }
  };

  addProduct = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append("file", fileInput.files[0]);

    axios
      .post("http://localhost:2000/add-product", file, {
        headers: {
          "content-type": "multipart/form-data",
          token: this.state.token,
        },
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
          type: "success",
        });

        this.handleProductClose();
        this.setState({ file: null, page: 1 }, () => {
          this.getProduct();
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleProductClose();
      });
  };

  updateProduct = () => {
    const fileInput = document.querySelector("#fileInput");
    const file = new FormData();
    file.append("id", this.state.id);
    file.append("file", fileInput.files[0]);

    axios
      .post("http://localhost:2000/update-product", file, {
        headers: {
          "content-type": "multipart/form-data",
          token: this.state.token,
        },
      })
      .then((res) => {
        swal({
          text: res.data.title,
          icon: "success",
          type: "success",
        });

        this.handleProductEditClose();
        this.setState({ file: null }, () => {
          this.getProduct();
        });
      })
      .catch((err) => {
        swal({
          text: err.response.data.errorMessage,
          icon: "error",
          type: "error",
        });
        this.handleProductEditClose();
      });
  };

  downloadFile = async () => {
    if (this.state.uniqueykey == this.state.downloadUniqekey) {
      try {
        const response = await fetch(this.state.downloadLink);
        const blob = await response.blob();

        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "downloaded_image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this.setState({ uniqueykey: "" });
      } catch (error) {
        this.setState({ uniqueykey: "" });
        console.error("Error downloading image:", error.message);
      }
    } else {
      this.setState({ uniqueykey: "" });
      alert("Please Enter valid 6 digit code");
    }
  };

  handleProductOpen = () => {
    this.setState({
      openProductModal: true,
      id: "",

      fileName: "",
    });
  };

  handleProductClose = () => {
    this.setState({ openProductModal: false });
  };

  handleProductEditOpen = (data) => {
    this.setState({
      openProductEditModal: true,
      id: data._id,

      fileName: data.image,
    });
  };

  handleProductEditClose = () => {
    this.setState({ openProductEditModal: false });
  };

  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div className="no-printme">
          <h2>UploadFile</h2>
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleProductOpen}
          >
            Add Product
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
          >
            Log Out
          </Button>
        </div>

        {/* Edit Product */}
        <Dialog
          open={this.state.openProductEditModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Edit Product</DialogTitle>
          <DialogContent>
            <br />
            <br />
            <Button variant="contained" component="label">
              {" "}
              Upload
              <input
                type="file"
                accept="image/*"
                name="file"
                value={this.state.file}
                onChange={this.onChange}
                id="fileInput"
                placeholder="File"
                hidden
              />
            </Button>
            &nbsp;
            {this.state.fileName}
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductEditClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.file === null}
              onClick={(e) => this.updateProduct()}
              color="primary"
              autoFocus
            >
              Edit Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Download Product */}
        <Dialog
          open={this.state.openProductDownloadModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Download File</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="uniqueykey"
              value={this.state.uniqueykey}
              onChange={this.onChange}
              placeholder="Enter Unique key"
              required
            />
            <br />

            <br />
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() =>
                this.setState({
                  openProductDownloadModal: false,
                })
              }
              color="primary"
            >
              Cancel
            </Button>
            <Button
              disabled={
                this.state.uniqueykey == "" || this.state.uniqueykey.length != 6
              }
              onClick={(e) => this.downloadFile()}
              color="primary"
              autoFocus
            >
              Download Product
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Product */}
        <Dialog
          open={this.state.openProductModal}
          onClose={this.handleProductClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Add Product</DialogTitle>
          <DialogContent>
            <br />
            <br />
            <Button variant="contained" component="label">
              {" "}
              Upload
              <input
                type="file"
                accept="image/*"
                name="file"
                value={this.state.file}
                onChange={this.onChange}
                id="fileInput"
                placeholder="File"
                hidden
                required
              />
            </Button>
            &nbsp;
            {this.state.fileName}
          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleProductClose} color="primary">
              Cancel
            </Button>
            <Button
              disabled={this.state.file === null}
              onClick={(e) => this.addProduct()}
              color="primary"
              autoFocus
            >
              Add Product
            </Button>
          </DialogActions>
        </Dialog>

        <br />

        <TableContainer>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Sr.no</TableCell>

                <TableCell align="center">Image</TableCell>
                <TableCell align="center">Uniquekey</TableCell>
                <TableCell align="center" className="no-printme">
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.products.map((row, index) => (
                <TableRow key={row.name}>
                  <TableCell align="center" component="th" scope="row">
                    {index + 1}
                  </TableCell>
                  <TableCell align="center">
                    <img
                      src={`http://localhost:2000/${row.image}`}
                      width="70"
                      height="70"
                    />
                  </TableCell>
                  <TableCell align="center" component="th" scope="row">
                    {row.uniqueykey}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      className="button_style no-printme"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) => this.handleProductEditOpen(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="button_style no-printme"
                      variant="outlined"
                      color="secondary"
                      size="small"
                      onClick={(e) => this.deleteProduct(row._id)}
                    >
                      Delete
                    </Button>
                    <Button
                      className="button_style no-printme"
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={(e) =>
                        this.setState({
                          openProductDownloadModal: true,
                          downloadLink: `http://localhost:2000/${row.image}`,
                          downloadUniqekey: row.uniqueykey,
                        })
                      }
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
          <Pagination
            className="no-printme"
            count={this.state.pages}
            page={this.state.page}
            onChange={this.pageChange}
            color="primary"
          />
        </TableContainer>
      </div>
    );
  }
}

export default withRouter(UploadFile);
